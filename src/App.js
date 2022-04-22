import { useState } from 'react'
import { FaPlus, FaTrashAlt } from 'react-icons/fa'

const calendars = require('./calendar.json')
const week = [
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
  'Domenica'
]

function App() {
  const [calendar, setCalendar] = useState(Object?.keys(calendars)?.[0]);
  const [days, setDays] = useState({})
  const [absences, setAbsences] = useState([])
  const [result, setResult] = useState({})

  const data = calendars[calendar]

  const dateToUnix = (date) => {
    if (!date) return undefined
    const [day, month] = date.split("/")
    let now = new Date()
    let year = now.getUTCFullYear()
    const start = data["start"].split("/")
    if (parseInt(month) >= parseInt(start[1])) {
      year--
    }
    let newDate = new Date(`${month}/${day}/${year}`)
    return newDate
  }

  return (
    <div className='min-w-screen min-h-screen w-full h-full p-5 flex flex-col items-center gap-3'>
      <div className='flex flex-row justify-center items-center gap-3'>
        <span className='font-bold'>Seleziona la tua regione:</span>
        <select onChange={(e) => setCalendar(e?.currentTarget?.value)} className='p-1 border shadow-md'>
          {
            Object.keys(calendars).map((k) => {
              return (
                <option key={k}>{ k }</option>
              )
            })
          }
        </select>
      </div>
      <span className='text-xl font-bold'>Inizio lezioni</span>
      {
        <input className='p-1 border shadow-md' type="date" defaultValue={dateToUnix(data["start"]).toISOString().substring(0, 10)} />
      }
      <span className='text-xl font-bold'>Festività</span>
      <div className='flex flex-col gap-2'>
        {
          data?.holidays?.map((info) => {
            return (
              <div key={info["name"]} className="shadow-md p-3 rounded-md">
                <p><span className='font-bold'>Nome: </span> { info["name"] }</p>
                <p><span className='font-bold'>Dat{ info["end"] !== undefined ? "e" : "a" }: </span>{ info["start"] } { info["end"] !== undefined ? "-" : "" } { info["end"] }</p>
              </div>
            )
          })
        } 
      </div>
      <span className='text-xl font-bold'>Orario settimanale</span>
      <div className='flex flex-col gap-2'>
        {
          week.map((day, i) => {
            if (days[day] === undefined) {
              days[day] = {
                enabled: i !== 6,
                hours: 0
              }
              setDays({...days})
            }
            return (
              <div key={day} className='flex flex-row justify-between p-3 shadow-md rounded-md items-center'>
                <span><input type="checkbox" onChange={(e) => {
                  days[day]["enabled"] = e?.currentTarget?.checked
                  setDays({...days})
                  absences.filter((absence) => {
                    return absence["day"] === i
                  }).forEach((absence) => {
                    let nextDay = 0
                    for (let i=0;i<week.length;i++) {
                      if (days?.[week[i]]["enabled"] === true) {
                        nextDay = i
                        break
                      }
                    }
                    absence[day] = nextDay
                  })
                }} defaultChecked={i !== 6} /> { day }</span>
                <input className='w-2/4 p-1 border shadow-md rounded-lg' type={"number"} placeholder="N. Ore" onChange={(e) => {
                  days[day]["hours"] = parseInt(e.currentTarget.value)
                  setDays({...days})
                }} />
              </div>
            )
          })
        }
      </div>
      <span className='text-xl font-bold'>Assenze/Ritardi</span>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-row p-3 gap-2 cursor-pointer hover:bg-slate-100 shadow-md rounded-md items-center' onClick={() => {
          setAbsences([{
            day: 0,
            hours: 0
          }, ...absences])
        }}>
          <FaPlus className='text-green-600' />
          <span>Aggiungi assenza/ritardo</span>
        </div>
        {
          absences.map((absence, index) => {
            return (
              <div key={index} className='flex flex-col p-3 gap-2 cursor-pointer hover:bg-slate-100 shadow-md rounded-md items-center'>
                <div className='w-full flex justify-between items-center'>
                  <span className='font-bold'>Giorno: </span>
                  <select className='w-2/4 p-1 border shadow-md rounded-lg' value={week.at(absence["day"])} onChange={(e) => {
                    absences[index]["day"] = week.indexOf(e.target.value)
                    setAbsences([...absences])
                  }}> { week.filter((day) => {
                    return days?.[day]["enabled"] === true
                  }).map((day) => {
                    return (
                      <option key={day}>{day}</option>
                    )
                  }) } </select>
                </div>
                <div className='w-full flex justify-between items-center'>
                  <span className='font-bold'>Ore di assenza: </span>
                  <input className='w-2/4 p-1 border shadow-md rounded-lg' type={"number"} placeholder="N. Ore" defaultValue={absence["hours"]} onChange={(e) => {
                    absences[index]["hours"] = parseInt(e?.currentTarget?.value)
                    setAbsences([...absences])
                  }} />
                </div>
                <span className='w-full rounded-lg flex flex-row items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 p-2' onClick={() => {
                  absences.splice(index, 1)
                  setAbsences([...absences])
                }}>
                  <FaTrashAlt />
                  Rimuovi assenza/ritardo
                </span>
              </div>
            )
          })
        }
      </div>
      <span className='p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-bold' onClick={() => {
        console.log(Object.keys(result))
        const start = dateToUnix(data["start"])
        const end = dateToUnix(data["end"])
        result["start"] = start.toISOString().slice(0, 10)
        result["end"] = end.toISOString().slice(0, 10)
        start.setDate(start.getDate()-1)

        const holidays = data.holidays.map((holiday) => {
          return {
            "start": dateToUnix(holiday?.["start"]),
            "end": dateToUnix(holiday?.["end"])
          }
        })

        let count = 0
        let hours = 0
        while (start.getUTCFullYear() < end.getUTCFullYear() || start.getMonth() <= end.getMonth() || start.getDate() <= end.getDate()) {
          start.setDate(start.getDate()+1)
          const holiday = holidays.find((h, i) => {
            if (h.end !== undefined) {
              return start.getTime() >= h.start.getTime() && start.getTime() <= h.end.getTime()
            }
            return h.start.getTime() === start.getTime()
          })
          if (holiday !== undefined) {
            continue
          }
          if (!days[week.at(start.getDay())]?.["enabled"]) {
            continue
          }
          
          count++
          hours += days[week.at(start.getDay())]?.["hours"]
        }

        let absenceHours = 0
        for (const absence of absences) {
          if (isNaN(absence["hours"]) || absence["hours"] === 0) {
            absenceHours += days[week.at(absence["day"])]["hours"]
            continue
          }
          absenceHours += absence["hours"]
        }

        result["count"] = count
        result["hours"] = hours
        result["absenceHours"] = absenceHours
        setResult({...result})
      }}>
        CALCOLA
      </span>
      {
        Object.keys(result).length !== 0 && (
          <div className='flex flex-col w-full'>
            <div className='flex flex-row justify-between'>
              <span className='font-bold'>Inizio lezioni:</span>
              { result["start"] }
            </div>
            <div className='flex flex-row justify-between'>
              <span className='font-bold'>Fine lezioni:</span>
              { result["end"] }
            </div>
            <div className='flex flex-row justify-between'>
              <span className='font-bold'>Giorni totali:</span>
              { result["count"] }
            </div>
            <div className='flex flex-row justify-between'>
              <span className='font-bold'>Ore totali:</span>
              { result["hours"] }
            </div>
            <div className='flex flex-row justify-between'>
              <span className='font-bold'>Ore di assenza possibili (25%):</span>
              { result["hours"] * 0.25 }
            </div>
            <div className='flex flex-row justify-between'>
              <span className='font-bold'>Ore di assenza:</span>
              { result["absenceHours"] }
            </div>
            <div className='flex flex-row justify-between'>
              <span className='font-bold'>Ore di assenza rimanenti:</span>
              { result["hours"] * 0.25 - result["absenceHours"] }
            </div>
          </div>
        )
      }
    </div>
  );
}

export default App;
