
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Gestiona RR")
    .addItem("Ingreso Rápido de Venta", "mostrarFormulario")
    .addItem("Ingreso Rápido de Gasto", "mostrarFormularioGasto")
    .addItem("Actualizar Balance", "actualizarBalanceMensual")
    .addToUi();
}


function mostrarFormulario() {
  var html = HtmlService.createHtmlOutputFromFile("formularioVenta")
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


function registrarIngresoMultiple(data) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    data.esMerma ? "Merma" : "Ventas"
  );
  const hojaProductos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Productos");
  const datosProductos = hojaProductos.getDataRange().getValues();
  const fecha = Utilities.formatDate(new Date(), "America/Santiago", "dd-MM-yyyy HH:mm:ss");

  for (let i = 0; i < data.productos.length; i++) {
    const item = data.productos[i];
    const total = item.cantidad * item.precio * (1 - item.descuento);
    const iva = total * 0.19;
    const margenUnitario = item.precio - item.costo;
    const filaProducto = datosProductos.findIndex(p => p[1] == item.id); // Columna B: ID

    if (data.esMerma) {
      hoja.appendRow([
        fecha,
        item.id,
        item.nombre,
        item.cantidad,
        item.precio,
        item.cantidad * item.precio,
        data.cliente || "",
        data.mailCliente || "",
        "Merma registrada desde formulario"
      ]);
    } else {
      hoja.appendRow([
        fecha,
        item.id,
        item.nombre,
        item.cantidad,
        item.precio,
        item.cantidad * item.precio,
        item.descuento,
        total,
        iva,
        item.costo,
        margenUnitario,
        margenUnitario * item.cantidad,
        data.cliente || "",
        data.mailCliente || "",
        data.canal || ""
      ]);
    }

    // Actualizar stock si el producto existe
    if (filaProducto > 0) {
      const stockActual = datosProductos[filaProducto][11]; // Columna L
      hojaProductos.getRange(filaProducto + 1, 12).setValue(stockActual - item.cantidad);
    }
  }

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

}

function actualizarBalanceMensual() {

  const ui = SpreadsheetApp.getUi();
  ui.alert("Actualizando balance mensual. Esto puede tardar unos segundos...");


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
