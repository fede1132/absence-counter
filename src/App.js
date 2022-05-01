import { useEffect, useState } from 'react'
import { FaHeart, FaGithub } from 'react-icons/fa'
import Absences from './components/Absences'

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
  const [days, setDays] = useState(null)
  const [absences, setAbsences] = useState(null)
  const [result, setResult] = useState(null)

  const data = calendars[calendar]

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("data"))

    const day = []
    for (let i=0;i<week.length;i++) {
      if (!day?.[i]) {
        day[i] = {
          enabled: i !== 6,
          hours: 0
        }
      }
    }

    if (days === null) data !== null ? setDays([...data?.["days"]]) : setDays([...day])
    if (absences === null) data !== null ? setAbsences([...data?.["absences"]]) : setAbsences([])
    if (result === null) data !== null ? setResult({...data?.["result"]}) : setResult({})
  }, [days, absences, result])

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

  const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
  }

  return (
    <div className='min-w-screen min-h-screen w-full h-full p-5 flex flex-col items-center gap-3'>
      <span className='text-xl font-bold'>Seleziona la tua regione</span>
      <select onChange={(e) => setCalendar(e?.currentTarget?.value)} className='p-1 border shadow-md'>
        {
          Object.keys(calendars).map((k) => {
            return (
              <option key={k}>{ k }</option>
            )
          })
        }
      </select>
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
            return (
              <div key={i} className='flex flex-row justify-between p-3 shadow-md rounded-md items-center'>
                <span><input type="checkbox" onChange={(e) => {
                  days[i]["enabled"] = e?.currentTarget?.checked
                  setDays([...days])
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
                <input className='w-2/4 p-1 border shadow-md rounded-lg' type={"number"} defaultValue={days?.[i]?.["hours"]} placeholder="N. Ore" onChange={(e) => {
                  days[i]["hours"] = parseInt(e.currentTarget.value)
                  setDays([...days])
                }} />
              </div>
            )
          })
        }
      </div>
      <span className='text-xl font-bold'>Assenze/Ritardi</span>
      <Absences absences={absences} setAbsences={setAbsences} week={week} dateToUnix={dateToUnix} days={days} />
      <span className='p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xl font-bold cursor-pointer' onClick={() => {
        localStorage.setItem("data", JSON.stringify({
          absences,
          days
        }))
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
        let current = 0
        while (start.getUTCFullYear() < end.getUTCFullYear() || start.getMonth() < end.getMonth() || start.getDate() <= end.getDate()) {
          start.setDate(start.getDate()+1)
          if (isToday(start)) {
            current = count+1
          }
          const holiday = holidays.find((h, i) => {
            if (h.end !== undefined) {
              return start.getTime() >= h.start.getTime() && start.getTime() <= h.end.getTime()
            }
            return h.start.getTime() === start.getTime()
          })
          if (holiday !== undefined) {
            continue
          }
          if (!days[start.getDay()]?.["enabled"]) {
            continue
          }
          count++
          hours += days[start.getDay()]?.["hours"]
          console.log(start)
        }

        let absenceHours = 0
        for (const absence of absences) {
          if (isNaN(absence["hours"]) || absence["hours"] === 0) {
            absenceHours += days[absence["day"]]["hours"]
            continue
          }
          absenceHours += absence["hours"]
        }

        result["count"] = count
        result["hours"] = hours
        result["absenceHours"] = absenceHours
        result["days_before_end"] = count - current
        setResult({...result})
        localStorage.setItem("data", JSON.stringify({
          result,
          absences,
          days
        }))
      }}>
        CALCOLA
      </span>
      {
        result && Object.keys(result).length !== 0 && (
          <div className='result flex flex-col w-full'>
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
              <span className='font-bold'>Giorni alla fine della scuola:</span>
              { result["days_before_end"] }
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
      <div className='flex flex-col mt-2'>
        <span className='flex flex-row justify-center items-center gap-1'>Made with <FaHeart className='text-red-600' /> by Federico Gualandri</span>
        <a className='flex flex-row justify-center items-center cursor-pointer gap-1 text-blue-600 underline' href="https://github.com/fede1132/absence-counter/"><FaGithub className='text-black' /> Codice sorgente disponibile su GitHub</a>
      </div>
    </div>
  );
}

export default App;
