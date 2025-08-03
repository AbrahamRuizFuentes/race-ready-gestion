
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Race Ready")
    .addItem("Ingreso Rápido de Venta", "mostrarFormulario")
    .addItem("Ingreso Rápido de Gasto", "mostrarFormularioGasto")
    .addItem("Actualizar Balance", "actualizarBalanceMensual")
    .addToUi();
}


function mostrarFormulario() {
  var html = HtmlService.createHtmlOutputFromFile("formulario")
      .setWidth(400)
      .setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, "Ingreso Rápido de Venta o Merma");
}

function mostrarFormularioGasto() {
  var html = HtmlService.createHtmlOutputFromFile("formularioGasto")
      .setWidth(400)
      .setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(html, "Registro Rápido de Gasto");
}


function obtenerDatosProducto(idProducto) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Productos");
  var datos = hoja.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0] == idProducto) {
      return {
        nombre: datos[i][2], // asumiendo que la columna c tiene el nombre
        precio: datos[i][12],
        costo: datos[i][13],
        fila: i + 1 // fila real en la hoja
      };
    }
  }
  return null;
}


function registrarIngreso(data) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    data.esMerma ? "Merma" : "Ventas"
  );
  var fecha = Utilities.formatDate(new Date(), "America/Santiago", "dd-MM-yyyy HH:mm:ss");
  if (data.esMerma) {
    hoja.appendRow([
      fecha,
      data.idProducto,
      data.nombreProducto,
      data.cantidad,
      data.precioUnitario,
      data.cantidad * data.precioUnitario,
      data.cliente || "",
      data.mailCliente || "",
      "Merma registrada desde formulario"
    ]);
  } else {
    var totalVenta = data.cantidad * data.precioUnitario * (1 - data.descuento);
    var iva = totalVenta * 0.19;
    var margenUnitario = data.precioUnitario - data.costoUnitario;
    hoja.appendRow([
      fecha,
      data.idProducto,
      data.nombreProducto,
      data.cantidad,
      data.precioUnitario,
      data.cantidad * data.precioUnitario,
      data.descuento,
      totalVenta,
      iva,
      data.costoUnitario,
      margenUnitario,
      margenUnitario * data.cantidad,
      data.cliente,
      data.mailCliente
    ]);
  }
    var hojaProductos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Productos");
    var datos = hojaProductos.getDataRange().getValues();
    for (var i = 1; i < datos.length; i++) {
     if (datos[i][1] == data.idProducto) { // Columna B = ID Producto
      var stockActual = datos[i][11]; // columna l = índice 11
      hojaProductos.getRange(i + 1, 12).setValue(stockActual - data.cantidad);
      break;
    }
  }
  actualizarBalanceMensual();


}

function obtenerListaProductos() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Productos");
  var datos = hoja.getDataRange().getValues();
  var productos = [];

  for (var i = 1; i < datos.length; i++) {
    var nombre = datos[i][2]; // Columna C = Nombre
    var id = datos[i][1];     // Columna B = ID Producto
    var precio = datos[i][12]; // Columna M = Precio Venta Unitario
    var costo = datos[i][13];  // Columna N = Costo Neto Unitario

    productos.push({
      id: id,
      nombre: nombre,
      precio: precio,
      costo: costo
    });
  }
  return productos;
}

function registrarGasto(data) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Gastos");
  const fecha = Utilities.formatDate(new Date(), "America/Santiago", "dd-MM-yyyy HH:mm:ss");

  hoja.appendRow([
    fecha,
    data.categoria,
    data.descripcion,
    data.monto,
    data.tipoGasto,
    data.proveedor,
    data.nota
  ]);

  actualizarBalanceMensual();
}

function actualizarBalanceMensual() {
  const hojaVentas = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ventas");
  const hojaGastos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Gastos");
  const hojaBalance = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Balance");

  const datosVentas = hojaVentas.getDataRange().getValues();
  const datosGastos = hojaGastos.getDataRange().getValues();

  const mesesES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  let resumen = {};

  // Procesar ventas
  for (let i = 1; i < datosVentas.length; i++) {
    let fecha = datosVentas[i][0]; // columna A
    const totalVenta = Number(datosVentas[i][7]) || 0; // columna H

    if (!(fecha instanceof Date)) {
      if (typeof fecha === "string") {
        const partes = fecha.split(" ")[0].split("-");
        if (partes.length !== 3) continue;
        fecha = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
      } else {
        continue; // si no es fecha ni string
      }
    }

    const mes = mesesES[fecha.getMonth()];
    if (!resumen[mes]) resumen[mes] = { ventas: 0, gastos: 0 };
    resumen[mes].ventas += totalVenta;
  }

  // Procesar gastos
  for (let i = 1; i < datosGastos.length; i++) {
    let fecha = datosGastos[i][0]; // columna A
    const monto = Number(datosGastos[i][3]) || 0; // columna D

    if (!(fecha instanceof Date)) {
      if (typeof fecha === "string") {
        const partes = fecha.split(" ")[0].split("-");
        if (partes.length !== 3) continue;
        fecha = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
      } else {
        continue;
      }
    }

    const mes = mesesES[fecha.getMonth()];
    if (!resumen[mes]) resumen[mes] = { ventas: 0, gastos: 0 };
    resumen[mes].gastos += monto;
  }

  // Limpiar columnas B, C y D, dejando encabezado y columna A intactos
  const ultimaFila = hojaBalance.getLastRow();
  for (let i = 2; i <= ultimaFila; i++) {
    const valorMes = hojaBalance.getRange(i, 1).getValue();
    if (valorMes === "" || valorMes.toString().toUpperCase() === "TOTAL") continue;
    hojaBalance.getRange(i, 2, 1, 3).clearContent();
  }

  // Escribir resultados en la hoja Balance
  for (let i = 2; i <= hojaBalance.getLastRow(); i++) {
    const nombreMes = hojaBalance.getRange(i, 1).getValue();
    if (!nombreMes || nombreMes.toString().toUpperCase() === "TOTAL") continue;

    const claveMes = nombreMes.toString().trim().toLowerCase();
    const match = Object.keys(resumen).find(m => m.toLowerCase() === claveMes);
    const valores = match ? resumen[match] : { ventas: 0, gastos: 0 };
    const resultado = valores.ventas - valores.gastos;

    hojaBalance.getRange(i, 2, 1, 3).setValues([[valores.ventas, valores.gastos, resultado]]);
  }
}