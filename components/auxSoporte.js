const {addProps} = require('./utils.js')

const opcionesBanderas = () => {
 return ["Elija desde donde necesita soporte","1. YPF","2. SHELL","3. AXION","4. PUMA","5. GULF","6. REFINOR","7. EST. BLANCA","8. OTRO"]
}

const banderaElegida = (from,body) => {

    switch (body) {
        case "1": 
            addProps(from,{bandera: "YP"})
            return true
        case "2": 
            addProps(from,{bandera: "SH"})
            return true
        case "3": 
            addProps(from,{bandera: "AX"})
            return true
        case "4": 
            addProps(from,{bandera: "PU"})
            return true
        case "5": 
            addProps(from,{bandera: "GU"})
            return true
        case "6": 
            addProps(from,{bandera: "RE"})
            return true   
        case "7": 
            addProps(from,{bandera: "BL"})
            return true
        case "8": 
            addProps(from,{bandera: "OT"})
            return true
       
        default:
            return false
       }

}

const opcionesZonas = () => {
    return ["Elija en que area se encuentra el puesto de trabajo donde necesita soporte","1. Playa","2. Tienda","3. Boxes","4. Administracion"]
}

const zonaElegida = (from,body) => {
    switch (body) {
        case "1": 
            addProps(from,{zone: "P"})
            return true;
        case "2": 
            addProps(from,{zone: "T"})
            return true;
        case "3": 
            addProps(from,{zone: "B"})
            return true;
        case "4": 
            addProps(from,{zone: "A"})
            return true;

        default:
            return false;
       }
}

module.exports = {zonaElegida,opcionesZonas,opcionesBanderas,banderaElegida}