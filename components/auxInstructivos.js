const {addProps,getCategory,getInstructivo} = require('./utils.js')

const fs = require('fs');
const path = require('path');

const categoriasInstructivos = () => {
  return ["Elija una categoria","1. Operación Playa","2. Operación Tienda"]
    //return ["Elija una categoria","1. Operación Playa","2. Operación Tienda","3. Admin - Contable"]
}

const categoriaElegida = (from,body) => {
    switch (body) {
        case "1": 
            addProps(from,{categoria: "Operación Playa"})
            return true
        case "2": 
            addProps(from,{categoria: "Operación Tienda"})
            return true
        /* case "3": 
            addProps(from,{categoria: "Admin - Contable"})
            return true */
       
        default:
            return false
       }

}

const opcionesInstructivos = (from) => {
  const categoria = getCategory(from);
  const mediaFolderPath = path.join(__dirname, `../media/${categoria}`);

  return new Promise((resolve, reject) => {
    // Leer el contenido de la carpeta "media"
    fs.readdir(mediaFolderPath, (err, files) => {
      if (err) {
        console.error('Error al leer la carpeta media:', err);
        reject(err);
        return;
      }

      // Filtrar los archivos PDF
      const pdfFiles = files.filter((file) => path.extname(file).toLowerCase() === '.pdf');

      // Construir el array de objetos con filename y path de los archivos PDF
      const pdfObjects = pdfFiles.map((file) => ({
        filename: file,
        path: path.join(mediaFolderPath, file),
      }));

      // Ordenar el array de objetos en base al número del nombre de archivo
      pdfObjects.sort((a, b) => {
        const numberA = parseInt(a.filename.match(/^\d+/)[0]);
        const numberB = parseInt(b.filename.match(/^\d+/)[0]);
        return numberA - numberB;
      });

      // Aquí tienes el array de objetos con filename y path de los archivos PDF ordenado
      addProps(from, { instructivos: pdfObjects });

      // Copiar los paths de los PDFs a la variable pdfPathsArray
      const pdfPathsArray = pdfObjects.map((pdfObject) => {
        const filenameWithoutExtension = pdfObject.filename.slice(0, -4);
        return filenameWithoutExtension;
      });

      // Calcular el número para el nuevo elemento
      const nextNumber = pdfPathsArray.length + 1;

      // Agregar el elemento con el formato deseado al array
      pdfPathsArray.push(`${nextNumber}. Salir`);

      resolve(pdfPathsArray);
    });
  });
};

  const sendFile = async (from, body, provider) => {

    const instructivo = getInstructivo(from, body);

    let prov = provider.getInstance();

    if(instructivo === "Salir"){
      await prov.sendMessage(`${from}@s.whatsapp.net`,{text:`Gracias por comunicarse con nosotros.`})
      return false
    }

    if(!instructivo) {
      await prov.sendMessage(`${from}@s.whatsapp.net`,{text:`Opción incorrecta. Envie "sigesbot" para volver a comenzar.`})
      return false
    }
  
    const filenameWithoutNumber = instructivo.filename.replace(/^\d+\.\s*/, '');
  
    const filenameWithoutExtension = filenameWithoutNumber.replace(/\.pdf$/, '');
  
    await prov.sendMessage(`${from}@s.whatsapp.net`, {
      document: { url: instructivo.path },
      fileName: filenameWithoutExtension,
    });

    await prov.sendMessage(`${from}@s.whatsapp.net`,{text:`Gracias por comunicarse con nosotros.`})

  };
  
   
module.exports = {sendFile,opcionesInstructivos,categoriasInstructivos,categoriaElegida}