# Manual de Usuario – Sistema de Gestión Race Ready

## Introducción
Este sistema fue desarrollado para registrar ventas y gastos de manera rápida y sencilla desde Google Sheets, con automatizaciones usando Google Apps Script.

---

## Requisitos

- Tener cuenta de Google con acceso a Google Sheets y Google Apps Script.
- Conceder permisos para ejecutar el script la primera vez.

---

## Módulos disponibles

### 1. Registro Rápido de Venta
- Acceder desde el menú `Race Ready > Ingreso Rápido de Venta`.
- Buscar producto por nombre.
- Ingresar cantidad, descuento (opcional), marcar si es merma.
- Ingresar datos del cliente (opcional).
- Al registrar: se actualiza automáticamente el inventario y se registra en la hoja correspondiente (`Ventas` o `Merma`).

### 2. Registro de Gastos
- Acceder desde `Race Ready > Ingreso Rápido de Gasto`.
- Seleccionar categoría y tipo de gasto.
- Agregar proveedor, si fue con factura, boleta o boleta de honorarios.
- Al registrar: el gasto se agrega a la hoja `Gastos`.

---

## Balance Mensual
- Usar `Race Ready > Actualizar Balance`.
- El balance mensual se actualiza automáticamente en la hoja `Balance`, mostrando:
  - Total de ventas
  - Total de gastos
  - Resultado neto
- Se calcula por mes a partir de la fecha del registro.

---

## Hojas del sistema

| Hoja       | Propósito                                       |
|------------|-------------------------------------------------|
| Productos  | Inventario con stock y precios                  |
| Ventas     | Registro de todas las ventas                    |
| Merma      | Registro de productos perdidos o dados de baja |
| Gastos     | Registro de egresos con detalles                |
| Balance    | Resumen mensual de ingresos y egresos          |

---

## Preguntas frecuentes

**¿Puedo editar los registros directamente desde las hojas?**  
Sí, pero se recomienda usar los formularios para mantener consistencia.

**¿Puedo agregar nuevas categorías de gasto?**  
Sí, editando directamente el formulario o pidiendo al desarrollador que lo actualice.

**¿Puedo usarlo con múltiples usuarios?**  
Sí, siempre que tengan acceso a la hoja y permisos para ejecutar los scripts.

---

© 2025 Abraham Angel Ruiz Fuentes
