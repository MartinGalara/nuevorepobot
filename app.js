const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const {default: makeWASocket} = require('@adiwajshing/baileys')
const { BufferJSON, useMultiFileAuthState } =require('@adiwajshing/baileys')

const dotenv = require("dotenv");
dotenv.config();

const flujoSiges = require('./components/flujoSiges.js')
const flujoImpresoraFiscal = require('./components/flujoImpresoraFiscal.js')
const flujoImpresoraComun = require('./components/flujoImpresoraComun.js')
const flujoDespachosCio = require('./components/flujoDespachosCio.js')
const flujoServidor = require('./components/flujoServidor.js')
const flujoLibroIva = require('./components/flujoLibroIva.js')
const flujoAplicaciones = require('./components/flujoAplicaciones.js')

const {testing,getBandera,isUnknown,addProps,deleteTicketData,validateUser,computers,computerOptions,computerInfo,sendMessage} = require('./components/utils.js')

const opcionesProblema = ['Despachos CIO','Aplicaciones','Impresora Fiscal / Comandera','Impresora Común / Oficina','Sistema SIGES','Libro IVA','Servidor']

const saludo = ['Gracias por comunicarte con Sistema SIGES.','Elija el numero de la opción deseada',`1. Generar un ticket de soporte`,'2. Salir']

const opciones = ['Elija el numero del problema que tiene','1. Despachos CIO','2. Aplicaciones','3. Impresora Fiscal / Comandera','4. Impresora Común / Oficina','5. Sistema SIGES','6. Libro IVA','7. Servidor']

const objOpciones = {
    1: "Despachos CIO",
    2: "Aplicaciones",
    3: "Impresora Fiscal / Comandera",
    4: "Impresora Común / Oficina",
    5: "Sistema SIGES",
    6: "Libro IVA",
    7: "Servidor"
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const flujoPrincipal = addKeyword(['sigesbot'])
.addAnswer(saludo,
{
    capture: true
},
async (ctx,{endFlow,fallBack}) => {

    deleteTicketData(ctx.from)
    if(ctx.message.hasOwnProperty('imageMessage')){
        await testing(ctx)
        return endFlow({body: `Escriba "sigesbot" para volver a comenzar`})
    }
    if(ctx.body === '2'){
        return endFlow({body: `Escriba "sigesbot" para volver a comenzar`})
    }
    if(ctx.body !== '1'){
        return fallBack();
    }
    
})
.addAnswer(["Elija desde donde necesita soporte","1. YPF","2. SHELL","3. AXION","4. PUMA","5. GULF","6. REFINOR","7. EST. BLANCA","8. OTRO"],
    {
        capture: true
    },
    (ctx,{fallBack}) => {
       switch (ctx.body) {
        case "1": 
            addProps(ctx.from,{bandera: "YP"})
            break;
        case "2": 
            addProps(ctx.from,{bandera: "SH"})
            break;
        case "3": 
            addProps(ctx.from,{bandera: "AX"})
            break;
        case "4": 
            addProps(ctx.from,{bandera: "PU"})
            break;
        case "5": 
            addProps(ctx.from,{bandera: "GU"})
            break;
        case "6": 
            addProps(ctx.from,{bandera: "RE"})
            break;   
        case "7": 
            addProps(ctx.from,{bandera: "BL"})
            break;
        case "8": 
            addProps(ctx.from,{bandera: "OT"})
            break;
       
        default:
            return fallBack();
       }
    })
.addAnswer(["Elija en que area se encuentra el puesto de trabajo donde necesita soporte","1. Playa","2. Tienda","3. Boxes","4. Administracion"],
    {
        capture: true
    },
    (ctx,{flowDynamic,fallBack}) => {
       switch (ctx.body) {
        case "1": 
            addProps(ctx.from,{zone: "P"})
            break;
        case "2": 
            addProps(ctx.from,{zone: "T"})
            break;
        case "3": 
            addProps(ctx.from,{zone: "B"})
            break;
        case "4": 
            addProps(ctx.from,{zone: "A"})
            break;

        default:
            return fallBack();
       }
    flowDynamic(getBandera(ctx.from))
    })
.addAnswer(['Si no lo conoce, solicitarlo a un operador de SIGES'],
{
    capture: true
},
async (ctx, {flowDynamic,fallBack,provider}) => {
    let id = ctx.body

//if(id !== "0"){
    const user = await validateUser(ctx.from,id)
    if(!user){
        const prov = provider.getInstance()
        await prov.sendMessage(`${ctx.from}@s.whatsapp.net`,{text:`Número invalido`})
        return fallBack();
    }
    addProps(ctx.from,{unknown: false})
    addProps(ctx.from,{id: id})
    addProps(ctx.from,{phone: ctx.from})
    await computers(ctx.from)
    const pcs = computerOptions(ctx.from);
    setTimeout(()=> {
        flowDynamic(pcs)
    },500)
/* }else{
    addProps(ctx.from,{unknown: true})
    addProps(ctx.from,{id: "No brinda identificador"})
    addProps(ctx.from,{userId: "No  brinda identificador"})
    addProps(ctx.from,{email: "No brinda identificador"})
    addProps(ctx.from,{tv: "No brinda identificador"})
    addProps(ctx.from,{pf: "No brinda identificador"})
    addProps(ctx.from,{vip: null})
    addProps(ctx.from,{phone: ctx.from})
    const pcs = computerOptions(ctx.from);
    setTimeout(()=> {
        flowDynamic(pcs)
    },500)
} */
})
.addAnswer(['Verificando'],
{
    capture: true
},
async (ctx,{provider}) => {

    if(!isUnknown(ctx.from)){
        const pcs = computerOptions(ctx.from);
        if(ctx.body > 0 && ctx.body <= pcs.length){
            computerInfo(ctx.from,ctx.body)
        }
        else{
            if(ctx.body === "0") addProps(ctx.from,{pf: "PC no esta en nuestra base de datos"})
            else addProps(ctx.from,{pf: ctx.body})
            addProps(ctx.from,{tv: "Consultar al cliente tv e indentificador de PC y reportarlo"})
        }
    }
    else{
        addProps(ctx.from,{info: ctx.body})
    }
    
})
.addAnswer(opciones,
{
    capture:true
},
(ctx, {fallBack}) => {

    const selected = ctx.body
    ctx.body = objOpciones[selected]

    if(!opcionesProblema.includes(ctx.body)) return fallBack()

    addProps(ctx.from,{problem: ctx.body}) 

},
[flujoSiges,flujoImpresoraFiscal,flujoImpresoraComun,flujoDespachosCio,flujoServidor,flujoLibroIva,flujoAplicaciones])


const asd = addKeyword(['asd'])
.addAnswer(['enviar mensaje'],
{
    capture: true
},
async (ctx,{provider}) => {

    console.log(ctx)
    await testing(ctx)

})

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flujoPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })  

    QRPortalWeb()
    
}

main()
