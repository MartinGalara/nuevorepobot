const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const dotenv = require("dotenv");
dotenv.config();

const flujoSiges = require('./components/flujoSiges.js')
const flujoImpresoraFiscal = require('./components/flujoImpresoraFiscal.js')
const flujoImpresoraComun = require('./components/flujoImpresoraComun.js')
const flujoDespachosCio = require('./components/flujoDespachosCio.js')
const flujoServidor = require('./components/flujoServidor.js')
const flujoLibroIva = require('./components/flujoLibroIva.js')
const flujoAplicaciones = require('./components/flujoAplicaciones.js')

const {getBandera,isUnknown,addProps,deleteTicketData,validateUser,computers,computerOptions,computerInfo,getQ1} = require('./components/utils.js')
const {opcionesBanderas,banderaElegida,opcionesZonas,zonaElegida} = require('./components/auxSoporte.js')
const {categoriasInstructivos,categoriaElegida,opcionesInstructivos,sendFile} = require('./components/auxInstructivos.js')

const opcionesProblema = ['Despachos CIO','Aplicaciones','Impresora Fiscal / Comandera','Impresora Común / Oficina','Sistema SIGES','Libro IVA','Servidor']

const saludo = ['Gracias por comunicarte con Sistema SIGES.','Elija el numero de la opción deseada',`1. Descargar un instructivo`,`2. Generar un ticket de soporte`,'3. Salir']

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
async (ctx,{endFlow,fallBack,flowDynamic}) => {

    deleteTicketData(ctx.from)
    if(ctx.body === '3'){
        return endFlow({body: `Escriba "sigesbot" para volver a comenzar`})
    }
    if(ctx.body !== '1' && ctx.body !== '2'){
        return fallBack();
    }
    if(ctx.body === '2') {
        addProps(ctx.from,{q1: "2"})
        const banderas = opcionesBanderas()
        setTimeout(()=> {
            flowDynamic(banderas)
        },500)
    }
    if(ctx.body === '1') {
        addProps(ctx.from,{q1: "1"})
        const categorias = await categoriasInstructivos(ctx.from)
        setTimeout(()=> {
            flowDynamic(categorias)
        },500)
    }
    
})
.addAnswer("Verificando",
    {
        capture: true
    },
    async (ctx,{fallBack,flowDynamic}) => {

    const prevAnswer = getQ1(ctx.from)
    
    switch (prevAnswer) {
        case "2":
            const flag = banderaElegida(ctx.from,ctx.body)
            if(!flag) {
                const banderas = opcionesBanderas()
                setTimeout(()=> {
                flowDynamic(banderas)
                },500)
                return fallBack();
            }

            const zonas = opcionesZonas()
            setTimeout(()=> {
                flowDynamic(zonas)
            },500)
        break;
        
        case "1":
            const category = categoriaElegida(ctx.from,ctx.body)
            if(!category){
                const categorias = await categoriasInstructivos(ctx.from)
                setTimeout(()=> {
                 flowDynamic(categorias)
                },500)
                return fallBack();
            }

            async function listado() {
                try {
                  const instructivos = await opcionesInstructivos(ctx.from);
                  setTimeout(() => {
                    flowDynamic(instructivos);
                  }, 500);
                } catch (error) {
                  console.error(error);
                }
              }

              listado();
        break;
    
        default:
            break;
    }

    })
.addAnswer('Verificando',
    {
        capture: true
    },
    (ctx,{flowDynamic,fallBack,provider,endFlow}) => {

        const prevAnswer = getQ1(ctx.from)
    
        switch (prevAnswer) {
            case "2":
                const zona = zonaElegida(ctx.from,ctx.body)
                if(!zona) {
                    const zonas = opcionesZonas()
                     setTimeout(()=> {
                    flowDynamic(zonas)
                    },500)
                    return fallBack();
                }
    
                flowDynamic(getBandera(ctx.from))
            break;
            
            case "1":
                sendFile(ctx.from,ctx.body,provider)
                return endFlow();
            break;
        
            default:
                break;
        }

    })
.addAnswer(['Si no lo conoce, solicitarlo a un operador de SIGES'],
{
    capture: true
},
async (ctx, {flowDynamic,fallBack,provider,endFlow}) => {

    if(ctx.body === "salir") return endFlow({body: "Escriba *sigesbot* para volver a comenzar"})
    else{
    let id = ctx.body

    const user = await validateUser(ctx.from,id)
    if(!user){
        const prov = provider.getInstance()
        await prov.sendMessage(`${ctx.from}@s.whatsapp.net`,{text:`Ingrese un número válido o envíe *salir* para volver a comenzar`})
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
    }
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


const asd = addKeyword(['asdasd'])
.addAnswer(['enviar mensaje'],
{
    capture: true
},
async (ctx,{provider}) => {

    let prov = provider.getInstance()
    await prov.sendMessage(`${ctx.from}@s.whatsapp.net`,{document: {url: './media/test.pdf'}})
    console.log(ctx)

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
