import { useState } from 'react'
import { FaPlus, FaTrashAlt, FaBook, FaTimes } from 'react-icons/fa'
import Login from './Login'

const re = new RegExp(/^(3[01]|[12][0-9]|[1-9])\/(1[0-2]|0?[1-9])$/)

export default function Absences({ absences, setAbsences, week, dateToUnix, days }) {
  const [login, setLogin] = useState(false)

  return (
    <div className='flex flex-col gap-2'>
      {
        login === false ?
          (
            <div className='flex flex-row p-3 gap-2 cursor-pointer hover:bg-slate-100 shadow-md rounded-md items-center' onClick={() => setLogin(true)}>
              <FaBook className='text-blue-600' />
              <span>Importa assenze da Argo didUP</span>
            </div>
          ) :
          <Login absences={absences} setAbsences={setAbsences} />
      }
      <div className='flex flex-row p-3 gap-2 cursor-pointer hover:bg-slate-100 shadow-md rounded-md items-center' onClick={() => {
        if (absences !== null) setAbsences([])
      }}>
        <FaTimes className='text-red-600' />
        <span>Cancella assenze/ritardi</span>
      </div>
      <div className='flex flex-row p-3 gap-2 cursor-pointer hover:bg-slate-100 shadow-md rounded-md items-center' onClick={() => {
        if (absences !== null) setAbsences([{
          day: 0,
          hours: 0
        }, ...absences])
      }}>
        <FaPlus className='text-green-600' />
        <span>Aggiungi assenza/ritardo</span>
      </div>
      {
        absences?.map((absence, index) => {
          return (
            <div key={index} className='flex flex-col p-3 gap-2 cursor-pointer hover:bg-slate-100 shadow-md rounded-md items-center'>
              <div className='w-full flex justify-between items-center gap-2'>
                <span className='font-bold'>Giorno: </span>
                <select className='w-2/4 p-1 border shadow-md rounded-lg' value={week.at(absence["day"])} onChange={(e) => {
                  absences[index]["day"] = week.indexOf(e.target.value)
                  setAbsences([...absences])
                }}>
                  {week.filter((_, i) => {
                    return days?.[i]?.["enabled"] === true
                  }).map((day) => {
                    return (
                      <option key={day}>{day}</option>
                    )
                  })}
                </select>
                <span>o</span>
                <input className='w-2/4 p-1 border shadow-md rounded-lg invalid:border-red-600' type={"text"} placeholder="Data (es. 22/04)" onChange={(e) => {
                  e.currentTarget.removeAttribute('invalid')
                  const date = re.exec(e?.currentTarget?.value)
                  if (date === null) {
                    e.currentTarget.toggleAttribute('invalid')
                    return
                  }
                  const result = dateToUnix(date[0])
                  absences[index]["day"] = result.getDay()
                  absences[index]["hours"] = days[result.getDay()]["hours"]
                  setAbsences([...absences])
                }} />
              </div>
              <div className='w-full flex justify-between items-center'>
                <span className='font-bold'>Ore di assenza: </span>
                <input className='w-2/4 p-1 border shadow-md rounded-lg' type={"number"} placeholder="N. Ore" defaultValue={absence["hours"]} onChange={(e) => {
                  absences[index]["hours"] = parseInt(e?.currentTarget?.value)
                  setAbsences([...absences])
                }} />
              </div>
              <span className='w-full rounded-lg flex flex-row items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 p-2' onClick={() => {
                absences?.splice(index, 1)
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
  )
}
