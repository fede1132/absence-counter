
export default class Argo {
    ARGOAPI_URL = "https://www.portaleargo.it/famiglia/api/rest/"
    ARGOAPI_KEY = "ax6542sdru3217t4eesd9"
    ARGOAPI_VERSION = "2.2.0"
    APP_CODE = "APF"
    APP_COMPANY = "ARGO Software s.r.l. - Ragusa"
    USER_AGENT="Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
    VERSION_REGEX = new RegExp(/([\d.])+/)
    
    information = {}
    logged = false
    version = ""

    async login(cod_min, username, password, version = this.ARGOAPI_VERSION) {
        const req = await this._curl("login", {
            "x-cod-min": cod_min,
            "x-user-id": username,
            "x-pwd": password
        }, {
            "_dc": Math.round(Date.now() / 1000)
        })
        if (req.status === 401) {
            return {
                success: false,
                code: "credentials.invalid"
            }
        }
        const data = await req.json()
        this.logged = true
        this.information = {
            cod_min,
            token: data?.["token"]
        }
        return {
            success: true
        }
    }

    async schede() {
        if (!this.logged) {
            return {
                success: false,
                code: "no.login"
            }
        }
        const req = await this._curl("schede", {
            "x-cod-min": this.information["cod_min"],
            "x-auth-token": this.information["token"]
        }, {
            "_dc": Math.round(Date.now() / 1000)
        })
        const data = await req.json()

        this.information = {...this.information, 
            'prg_alunno': data?.[0]?.["prgAlunno"],
            'prg_scuola': data?.[0]?.["prgScuola"],
            'prg_scheda': data?.[0]?.["prgScheda"],
        }

        return {
            success: true,
            data
        }
    }

    async assenze() {
        if (!this.logged) {
            return {
                success: false,
                code: "no.login"
            }
        }
        if (this.information["prg_alunno"] === null) {
            return {
                success: false,
                code: "no.schede"
            }
        }
        const req = await this._curl("assenze", {
            "x-cod-min": this.information["cod_min"],
            "x-auth-token": this.information["token"],
            "x-prg-alunno": this.information["prg_alunno"],
            "x-prg-scheda": this.information["prg_scheda"],
            "x-prg-scuola": this.information["prg_scuola"]
        }, {
            "_dc": Math.round(Date.now() / 1000)
        })
        const data = await req.json()

        return {
            success: true,
            data: data?.["dati"]
        }
    }

    async _curl(request, auxiliaryHeader, auxiliaryQuery = {}, type = 'GET') {
        let defaultHeader = { "x-key-app": this.ARGOAPI_KEY, "x-version": this.ARGOAPI_VERSION, "x-produttore-software": this.APP_COMPANY, "x-app-code": this.APP_CODE, "user-agent": this.USER_AGENT};
        let header = { ...defaultHeader, ...auxiliaryHeader };
        let query = { '_dc': Date.now(), ...auxiliaryQuery }
        return await fetch(this.ARGOAPI_URL + request + '?' + Object.keys(query).map(key => key + '=' + query[key]).join('&'), {
            headers: header,
            method: type
        })
    }
}
