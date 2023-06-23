const axios = require('axios')
const nodemailer = require("nodemailer")
const dotenv = require("dotenv");
const { downloadMediaMessage } = require('@adiwajshing/baileys')
const { writeFile } = require('fs/promises')
const FormData = require('form-data');

dotenv.config();

let ticket = {}

/* const sendEmail = async (from) => {

  await getStaff(from)

  const fs = require('fs');
    
    const API_KEY = `${process.env.FRESHDESK_API}`;
    const FD_ENDPOINT = 'sistemasiges';
    const PATH = '/api/v2/tickets';
    const encoding_method = 'base64';
    const auth = 'Basic ' + Buffer.from(API_KEY + ':' + 'X').toString(encoding_method);
    const URL = 'https://' + FD_ENDPOINT + '.freshdesk.com' + PATH;

    const ccs = ticket[from].staff.mails

    if(ticket[from.vipmail]) ccs.push(ticket[from].vipmail)

    const form = new FormData();
    form.append('name', ticket[from].info);
    form.append('phone', ticket[from].phone);
    form.append('subject', `${ticket[from].info} | Soporte para ${ticket[from].problem} | ${ticket[from].pf}`);
    form.append('type', 'Incidente');
    form.append('custom_fields[cf_recibido_por]', 'Bot');
    form.append('custom_fields[cf_identificador]', ticket[from].userId);

    if(ticket[from].mailAttachments){
    for (let i = 0; i < ticket[from].mailAttachments.length; i++) {
      
      const path = `./${ticket[from].phone}${ticket[from].mailAttachments[i].order}.${ticket[from].mailAttachments[i].type}`;
      await writeFile(path, ticket[from].mailAttachments[i].payload);
      form.append('attachments[]', fs.createReadStream(path));
      
      }
    }

    ccs.forEach((ccEmail) => {
      form.append('cc_emails[]', ccEmail);
    });

    var headers = {
      'Authorization': auth
    };

   let description = ""

  if(ticket[from].problem === "Despachos CIO" || ticket[from].problem === 'Servidor'){
    description = `
    <div>
    <p>Datos del ticket</p>
    <p>Soporte para: ${ticket[from].problem}</p>
    <p>ID Cliente: ${ticket[from].userId}</p>
    <p>Info Cliente: ${ticket[from].info}</p>
    <p>Teléfono que genero el ticket: ${ticket[from].phone}</p>
    <p>Punto de facturación / PC: ${ticket[from].pf}</p>
    <p>ID TeamViewer: ${ticket[from].tv}</p>
    <p>Descripción del problema: ${ticket[from].description}</p>
    <p>Urgencia indicada por el cliente: ${ticket[from].priority}</p>
    <br></br>
    <p>Para generar un ticket de operador: ${process.env.URL_OPTICKET}</p>
    </div>
    ` // html body
  }else if(ticket[from].problem === "Sistema SIGES" || ticket[from].problem === 'Aplicaciones'){
    description = `
    <div>
    <p>Datos del ticket</p>
    <p>Soporte para: ${ticket[from].problem}</p>
    <p>ID Cliente: ${ticket[from].userId}</p>
    <p>Info Cliente: ${ticket[from].info}</p>
    <p>Teléfono que genero el ticket: ${ticket[from].phone}</p>
    <p>Punto de facturación / PC: ${ticket[from].pf}</p>
    <p>ID TeamViewer: ${ticket[from].tv}</p>
    <p>Origen del problema: ${ticket[from].type}</p>
    <p>Descripción del problema: ${ticket[from].description}</p>
    <p>Urgencia indicada por el cliente: ${ticket[from].priority}</p>
    <br></br>
    <p>Para generar un ticket de operador: ${process.env.URL_OPTICKET}</p>
    </div>
    ` // html body
  }else if(ticket[from].problem === "Libro IVA"){
    description = `
    <div>
    <p>Datos del ticket</p>
    <p>Soporte para: ${ticket[from].problem}</p>
    <p>ID Cliente: ${ticket[from].userId}</p>
    <p>Info Cliente: ${ticket[from].info}</p>
    <p>Teléfono que genero el ticket: ${ticket[from].phone}</p>
    <p>Solicitud: ${ticket[from].type}</p>
    <p>Período: ${ticket[from].timeFrame}</p>
    <p>Punto de facturación / PC: ${ticket[from].pf}</p>
    <p>ID TeamViewer: ${ticket[from].tv}</p>
    <p>Descripción / Info adicional: ${ticket[from].description}</p>
    <p>Urgencia indicada por el cliente: ${ticket[from].priority}</p>
    <br></br>
    <p>Para generar un ticket de operador: ${process.env.URL_OPTICKET}</p>
    </div>
    `
  }
  else{
    description = `
    <div>
    <p>Datos del ticket</p>
    <p>Soporte para: ${ticket[from].problem}</p>
    <p>ID Cliente: ${ticket[from].userId}</p>
    <p>Info Cliente: ${ticket[from].info}</p>
    <p>Teléfono que genero el ticket: ${ticket[from].phone}</p>
    <p>Solicitud: ${ticket[from].type}</p>
    <p>Punto de facturación / PC: ${ticket[from].pf}</p>
    <p>ID TeamViewer: ${ticket[from].tv}</p>
    <p>Descripción / Info adicional: ${ticket[from].description}</p>
    <p>Urgencia indicada por el cliente: ${ticket[from].priority}</p>
    <br></br>
    <p>Para generar un ticket de operador: ${process.env.URL_OPTICKET}</p>
    </div>
    `
  } 

  form.append('description', description);

  let freshTicketInfo = {
    id: "",
    url: "https://sistemasiges.freshdesk.com/helpdesk/tickets/"
  }

  try {
    const response = await axios.post(URL, form, {
      headers: headers
    });

    console.log(response.data);
    console.log('Response Status: ' + response.status);
    if (response.status === 201) {
      console.log('Location Header: ' + response.headers['location']);
      freshTicketInfo.id = response.data.id
      freshTicketInfo.url = freshTicketInfo.url + response.data.id
    } else {
      console.log('X-Request-Id: ' + response.headers['x-request-id']);
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
  }

  if(ticket[from].mailAttachments){
  for (let i = 0; i < ticket[from].mailAttachments.length; i++) {   
    const path = `./${ticket[from].phone}${ticket[from].mailAttachments[i].order}.${ticket[from].mailAttachments[i].type}`;
    fs.unlink(path, (err) => {
      if (err) {
        console.error('Error al eliminar el archivo:', err);
        return;
      }
      console.log('Archivo eliminado:', path);
    }); 
  } 
}

console.log(ticket)

return freshTicketInfo
  
} */

const sendEmail = async (from) => {

  const newTicket = await createTicket(ticket[from].userId)

  await getStaff(from)

  let reciever = ""
  if(ticket[from].testing === true){
    reciever = process.env.TESTINGMAIL
  }else{
    reciever = process.env.RECIEVER
  }

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SENDER, // generated ethereal user
      pass: process.env.GMAIL_PASS, // generated ethereal password
    },
  });

  let replyTo = ticket[from].staff.mails.join(', ')

  if(ticket[from].vipmail){
    if(replyTo === ''){
      replyTo = ticket[from].vipmail
    }else{
      replyTo = replyTo + ', ' + ticket[from].vipmail
    }
  }

  let data = {
    from: `"WT ${newTicket.id}" <${process.env.SENDER}>`, // sender address
    to: reciever, // list of receivers
    cc: replyTo,
    subject: `WT ${newTicket.id} | ${ticket[from].info} | Soporte para ${ticket[from].problem} | ${ticket[from].pf}`, // Subject line
    text: `WT ${newTicket.id} | ${ticket[from].info} | Soporte para ${ticket[from].problem} | ${ticket[from].pf}`, // plain text body
    replyTo: replyTo
  }

  if(ticket[from].mailAttachments && ticket[from].mailAttachments.length !== 0){
    data.attachments = ticket[from].mailAttachments;
  }

  if(ticket[from].problem === "Despachos CIO" || ticket[from].problem === 'Servidor'){
    data.html = `
    <div>
    <p>Datos del ticket</p>
    <p>Soporte para: ${ticket[from].problem}</p>
    <p>ID Cliente: ${ticket[from].userId}</p>
    <p>Info Cliente: ${ticket[from].info}</p>
    <p>Teléfono que genero el ticket: ${ticket[from].phone}</p>
    <p>Punto de facturación / PC: ${ticket[from].pf}</p>
    <p>ID TeamViewer: ${ticket[from].tv}</p>
    <p>Descripción del problema: ${ticket[from].description}</p>
    <p>Urgencia indicada por el cliente: ${ticket[from].priority}</p>
    <br></br>
    <p>Para generar un ticket de operador: ${process.env.URL_OPTICKET}</p>
    </div>
    ` // html body
  }else if(ticket[from].problem === "Sistema SIGES" || ticket[from].problem === 'Aplicaciones'){
    data.html = `
    <div>
    <p>Datos del ticket</p>
    <p>Soporte para: ${ticket[from].problem}</p>
    <p>ID Cliente: ${ticket[from].userId}</p>
    <p>Info Cliente: ${ticket[from].info}</p>
    <p>Teléfono que genero el ticket: ${ticket[from].phone}</p>
    <p>Punto de facturación / PC: ${ticket[from].pf}</p>
    <p>ID TeamViewer: ${ticket[from].tv}</p>
    <p>Origen del problema: ${ticket[from].type}</p>
    <p>Descripción del problema: ${ticket[from].description}</p>
    <p>Urgencia indicada por el cliente: ${ticket[from].priority}</p>
    <br></br>
    <p>Para generar un ticket de operador: ${process.env.URL_OPTICKET}</p>
    </div>
    ` // html body
  }else if(ticket[from].problem === "Libro IVA"){
    data.html = `
    <div>
    <p>Datos del ticket</p>
    <p>Soporte para: ${ticket[from].problem}</p>
    <p>ID Cliente: ${ticket[from].userId}</p>
    <p>Info Cliente: ${ticket[from].info}</p>
    <p>Teléfono que genero el ticket: ${ticket[from].phone}</p>
    <p>Solicitud: ${ticket[from].type}</p>
    <p>Período: ${ticket[from].timeFrame}</p>
    <p>Punto de facturación / PC: ${ticket[from].pf}</p>
    <p>ID TeamViewer: ${ticket[from].tv}</p>
    <p>Descripción / Info adicional: ${ticket[from].description}</p>
    <p>Urgencia indicada por el cliente: ${ticket[from].priority}</p>
    <br></br>
    <p>Para generar un ticket de operador: ${process.env.URL_OPTICKET}</p>
    </div>
    `
  }
  else{
    data.html = `
    <div>
    <p>Datos del ticket</p>
    <p>Soporte para: ${ticket[from].problem}</p>
    <p>ID Cliente: ${ticket[from].userId}</p>
    <p>Info Cliente: ${ticket[from].info}</p>
    <p>Teléfono que genero el ticket: ${ticket[from].phone}</p>
    <p>Solicitud: ${ticket[from].type}</p>
    <p>Punto de facturación / PC: ${ticket[from].pf}</p>
    <p>ID TeamViewer: ${ticket[from].tv}</p>
    <p>Descripción / Info adicional: ${ticket[from].description}</p>
    <p>Urgencia indicada por el cliente: ${ticket[from].priority}</p>
    <br></br>
    <p>Para generar un ticket de operador: ${process.env.URL_OPTICKET}</p>
    </div>
    `
  }

  const mail = await transporter.sendMail(data);

  console.log(ticket)
  console.log("ticket")

  return newTicket.id

}

const validateUser = async (from,id) => {

const fullId = ticket[from].bandera + id

addProps(from,{userId: fullId})

  const config = {
    method: 'get',
    url: `${process.env.SERVER_URL}/users?id=${fullId}`,
}

  const user = await axios(config)

  if(user.data.length !== 0){
    ticket[from].info = user.data[0].info
    ticket[from].vip = user.data[0].vip
    ticket[from].vipmail = user.data[0].vipmail
    ticket[from].testing = user.data[0].testing
    return user.data[0]
  }
  else{
    return false
  }
}

const addProps = (from,props) => {
  if(ticket.hasOwnProperty(from)){
    Object.assign(ticket[from], props);
  }
  else{
    ticket[from] = {}
    Object.assign(ticket[from], props);
  }
}

const createTicket = async (userId) => {

  const config = {
    method: 'post',
    url: `${process.env.SERVER_URL}/tickets`,
    data:{
      userId: userId
    }
  }

  const ticket = await axios(config)

  return ticket.data 

}

const computers = async (from) => {
  
  const config = {
    method: 'get',
    url: `${process.env.SERVER_URL}/computers?userId=${ticket[from].userId}&zone=${ticket[from].zone}`,
  }

  const computers = await axios(config).then((i) => i.data)

  const hasOrder = computers.some((computer) => computer.order !== null);

  if(hasOrder){
    computers.sort((a, b) => a.order - b.order);
  }else{
    computers.sort((a, b) => {
      if (a.alias < b.alias) return -1;
      if (a.alias > b.alias) return 1;
      return 0;
    });
  }

  ticket[from].computers = []
  computers.map( e=> {
    ticket[from].computers.push(e)
  })

}

const computerOptions = (from) => {

  if(ticket[from].id !== "No brinda identificador"){

    if(ticket[from].computers.length === 0) return ['No se encontraron puestos de trabajo registrados en esta zona','Envie 0 para continuar']

    const array = ['Elija el número del puesto de trabajo donde necesita soporte','Si no lo sabe o ninguno es correcto, envíe "0"']

    let i = 1;
  
    ticket[from].computers.map(e => {

      array.push({
        body: `${i} - ${e.alias}`
      })
      i++;
      
    })
  
    return array;
  }
  else{
    const array = ['En un solo mensaje, indique en que estacion / shop y en que puesto de trabajo necesita soporte']

    return array;
  }

 

}

const computerInfo = (from,option) => {

  if(ticket[from].computers[option-1] && option !== "0"){
    ticket[from].pf = ticket[from].computers[option-1].alias
    ticket[from].tv = ticket[from].computers[option-1].teamviewer_id
  }

}

/* const addAudio = async (from,ctx) => {

  if(!ticket[from].hasOwnProperty("mailAttachments")){
    ticket[from].mailAttachments = []
  }

  const buffer = await downloadMediaMessage(ctx,'buffer')

  ticket[from].mailAttachments.push({
    order: ticket[from].mailAttachments.length,
    type: "mp3",
    payload: buffer
  })

} */

const addAudio = async (from,ctx) => {

  if(!ticket[from].hasOwnProperty("mailAttachments")){
    ticket[from].mailAttachments = []
  }

  const buffer = await downloadMediaMessage(ctx,'buffer')

  const audio = {
    filename: 'adjunto.mp3',
    content: Buffer.from(buffer, 'base64')
  }
  ticket[from].mailAttachments.push(audio)

}

/* const addImage = async (from,ctx) => {

  if(!ticket[from].hasOwnProperty("mailAttachments")){
    ticket[from].mailAttachments = []
  }

  const buffer = await downloadMediaMessage(ctx,'buffer')

  ticket[from].mailAttachments.push({
    order: ticket[from].mailAttachments.length,
    type: "jpg",
    payload: buffer
  })

} */

const addImage = async (from,ctx) => {

  if(!ticket[from].hasOwnProperty("mailAttachments")){
    ticket[from].mailAttachments = []
  }

  const buffer = await downloadMediaMessage(ctx,'buffer')

    const image = {
      filename: 'adjunto.jpg',
      content: Buffer.from(buffer, 'base64')
    }
    ticket[from].mailAttachments.push(image)

}

const deleteTicketData = (from) => {
  ticket[from] = {}
}


const sendMessage = async (from,provider,ticketId) => {

  let prov = provider.getInstance()

  let zone = ""

  switch(ticket[from].zone){
    case "P":
      zone = "Playa"
      break;
      
    case "B":
      zone = "Boxes"
      break;

    case "A":
      zone = "Administracion"
      break;

    case "T":
      zone = "Tienda"
      break;
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const hourOfDay = today.getHours();
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6 || (dayOfWeek === 5 && hourOfDay >= 20) || (dayOfWeek === 1 && hourOfDay < 6));

  if (isWeekend) {
    const telefono = process.env.GUARDIA + '@s.whatsapp.net'
    await prov.sendMessage(telefono,{text:`WT: ${ticketId} - El cliente ${ticket[from].info} genero un ticket pidiendo soporte para ${zone} - ${ticket[from].problem}. Nivel de urgencia: ${ticket[from].priority}`})
  }

  if(!ticket[from].unknown && ticket[from].vip){
      
    await prov.sendMessage(`${from}@s.whatsapp.net`,{text:`Tu ejecutivo de cuenta ya fue notificado del problema`})

    const telefono = ticket[from].vip
    await prov.sendMessage(telefono,{text:`El cliente ${ticket[from].info} genero un ticket pidiendo soporte para ${zone} - ${ticket[from].problem}. Nivel de urgencia: ${ticket[from].priority}`})
  }

  for (let i = 0; i < ticket[from].staff.phones.length; i++) {
    
    if(ticket[from].staff.phones[i]){
    await prov.sendMessage(ticket[from].staff.phones[i],{text:`Se genero un ticket pidiendo soporte para ${zone} - ${ticket[from].problem}. Nivel de urgencia: ${ticket[from].priority}`})
    }

  }

  delete ticket[from]

}

const isUnknown = (from) => {
  return ticket[from].unknown
}

const getBandera = (from) => {

  switch (ticket[from].bandera){

        case "YP": 
            return [{body: "Ingrese su numero de APIES"}]

        case "SH": 
            return [{body: "Ingrese su numero de identificacion SHELL"}]

        case "AX": 
            return [{body: "Ingrese su numero de identificacion AXION"}]

        case "PU": 
            return [{body: "Ingrese su numero de identificacion PUMA"}]

        case "GU": 
           return [{body: "Ingrese su numero de identificacion GULF"}]

        case "RE": 
            return [{body: "Ingrese su numero de identificacion REFINOR"}]

        case "BL": 
            return [{body: "Ingrese su numero de identificacion"}]

        case "OT": 
            return [{body: "Ingrese su numero de identificacion"}]

        default:
          return

  }

}

const tvInDb = (from) => {
  if(ticket[from].tv === "Consultar al cliente tv e indentificador de PC y reportarlo"){
    return false
  }else{
    return true
  }
}

const getStaff = async (from) => {

  const config = {
    method: 'get',
    url: `${process.env.SERVER_URL}/staffs?userId=${ticket[from].userId}`,
  }

  const staff = await axios(config).then((i) => i.data)

  ticket[from].staff = {}
  ticket[from].staff.mails = []
  ticket[from].staff.phones = []

  const mails = []
  const phones = []

  staff.map( e => {
    if(e.zone === null || e.zone === ticket[from].zone) {
      mails.push(e.email)
      phones.push(e.phone)
    }
  })

  ticket[from].staff.mails = mails
  ticket[from].staff.phones = phones
  
}

const testing = async (ctx) => {
  const attachments = ['path1', 'path2', 'path3']; // Array con las rutas de los archivos adjuntos
  const path = './LALALA.jpeg';
  var fs = require('fs')

  const buffer = await downloadMediaMessage(ctx, 'buffer');
  await writeFile(path, buffer);

  const API_KEY = `${process.env.FRESHDESK_API}`;
  const FD_ENDPOINT = 'sistemasiges';
  const PATH = '/api/v2/tickets';
  const encoding_method = 'base64';
  const auth = 'Basic ' + Buffer.from(API_KEY + ':' + 'X').toString(encoding_method);
  const URL = 'https://' + FD_ENDPOINT + '.freshdesk.com' + PATH;

  const fields = {
    email: 'mgalara@gmail.com',
    subject: 'Ticket subject',
    type: 'Incidente',
    'custom_fields[cf_recibido_por]': 'Bot',
    cc_emails: ['mgalara@gmail.com', 'mgalara2@gmail.com']
  };

  fields.description = 'Lalala';

  const form = new FormData();
  form.append('email', fields.email);
  form.append('subject', fields.subject);
  form.append('type', fields.type);
  form.append('custom_fields[cf_recibido_por]', fields['custom_fields[cf_recibido_por]']);
  form.append('attachments[]', fs.createReadStream(path));

  fields.cc_emails.forEach((ccEmail) => {
    form.append('cc_emails[]', ccEmail);
  });

  const headers = {
    'Authorization': auth,
    ...form.getHeaders()
  };

  try {
    const response = await axios.post(URL, form, {
      headers: headers
    });

    console.log(response.data);
    console.log('Response Status: ' + response.status);
    if (response.status === 201) {
      console.log('Location Header: ' + response.headers['location']);
    } else {
      console.log('X-Request-Id: ' + response.headers['x-request-id']);
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
  }

  fs.unlink(path, (err) => {
    if (err) {
      console.error('Error al eliminar el archivo:', err);
      return;
    }
    console.log('Archivo eliminado:', path);
  });
};


module.exports = {testing,tvInDb,getBandera,isUnknown,sendEmail,validateUser,addProps,computers,computerOptions,computerInfo,addAudio,addImage,deleteTicketData,sendMessage}