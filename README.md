# Race Ready Gestión

Race Ready Gestión es un sistema de control administrativo desarrollado con Google Sheets y Google Apps Script para una tienda de suplementos deportivos y accesorios para deportes de resistencia.

## Funcionalidades principales

- Registro de ventas y mermas con formulario automatizado
- Registro de gastos categorizados (fijo/variable, proveedor, tipo de documento)
- Cálculo de balance mensual (ventas, gastos, resultado neto)
- Actualización dinámica de stock
- Panel administrativo con menú personalizado

## Tecnologías utilizadas

- Google Apps Script
- HTML/CSS (formularios)
- Google Sheets

## Estructura del repositorio

```
race-ready-gestion/
├── src/
│   ├── Codigo.gs
│   ├── formulario.html
│   └── formularioGasto.html
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Instalación y uso

1. Crear una copia del archivo Google Sheets.
2. Ingresar a Extensiones > Apps Script y pegar los archivos en su lugar correspondiente.
3. Ejecutar `onOpen()` para generar el menú.
4. Comenzar a registrar ventas y gastos.

## Créditos

Desarrollado por Abraham Ruiz.
