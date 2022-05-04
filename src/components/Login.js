import { useRef, useState } from "react"
import Argo from "../lib/argo"

export default function Login({ absences, setAbsences }) {
    const code = useRef(null)
    const username = useRef(null)
    const password = useRef(null)
    const tos = useRef(null)
    const [error, setError] = useState(null)

    return (
        <div className="w-1/2 flex flex-col justify-center items-center gap-2 self-center">
            <span className="text-xl font-bold">Accesso</span>
            <input ref={code} className="p-2 shadow-lg rounded-lg w-full" type="text" placeholder="Codice scuola" />
            <label className="text-slate-400 text-sm">Codice scuola gobetti = sg17741</label>
            <input ref={username} className="p-2 shadow-lg rounded-lg w-full" type="text" placeholder="Nome utente" />
            <input ref={password} className="p-2 shadow-lg rounded-lg w-full" type="password" placeholder="Password" />
            <p><input ref={tos} type="checkbox" /> Accetto i <a href="/tos.txt" className="underline text-blue-900 hover:text-blue-800 cursor-pointer">termini e condizioni</a></p>
            {
                error !== null && (
                    <div className="p-2 bg-opacity-70 bg-red-600 text-white font-bold rounded-lg">
                        { error }
                    </div>
                )
            }
            <span className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold p-2 cursor-pointer" onClick={async () => {
                const school = code?.current?.value
                const user = username?.current?.value
                const pass = password?.current?.value
                const check = tos?.current?.checked
                setError(null)
                if (!check) {
                    setError("Devi accettare i termini e condizioni!")
                    return
                }

                const argo = new Argo()
                await argo.login(school, user, pass)
                await argo.schede()
                const data = await argo.assenze()

                absences = []
                for (const assenza of data?.["data"]) {
                    const date = new Date(assenza?.["datAssenza"])
                    absences = [...absences, {
                        day: date.getDay(),
                        hours: assenza?.["codEvento"] === "A" ? 0 : assenza?.["numOra"]-1 ?? 0,
                    }]
                }
                setAbsences([...absences])
            }}>Accedi</span>
            <label className="text-sm flex-wrap text-justify">Nessun dato viene salvato in memoria o inviato a server che non siano di "ARGO Software s.r.l. - Ragusa"</label>
        </div>
    )
}
