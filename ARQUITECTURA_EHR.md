# Ingeniería Inversa y Arquitectura del Sistema de Historia Clínica Odontológica (Dental EHR)

Basado en el análisis de mercado de plataformas líderes en Colombia y Latinoamérica (**Dentalink**, **Odontex**, **Doctoralia**, **SoftDental**) y en la normativa del Ministerio de Salud de Colombia (**Resolución 2275 de 2023 - RIPS JSON / FEV DIAN**).

---

## 1. Estudio de Mercado e Ingeniería Inversa de Módulos

```
                                  SISTEMA DENTAL EHR
                                           │
    ┌──────────────┬───────────────┼───────────────┬──────────────┬─────────────┐
    ▼              ▼               ▼               ▼              ▼             ▼
[PACIENTES &    [HISTORIA       [ODONTOGRAMA    [PLANES DE     [LABORATORIOS  [NORMATIVA
 AGENDA]        CLÍNICA]         INTERACTIVO]    TRATAMIENTO]   & BIOPRECISIÓN] COLOMBIA]
 • Citas/Box    • Anamnesis     • 52 Dientes    • Presupuestos • Órdenes 3D   • RIPS JSON
 • WhatsApp Bot • Antecedentes  • FDI / Universal • Fases      • Guías Impl.  • FEV DIAN
 • No-Shows     • Evolución     • Caras/Trat.   • Cobros/Caja  • Alineadores  • Consentimientos
```

### Módulo 1: Gestión de Pacientes y Agenda Multicaja (Boxes)
* **Ingeniería Inversa:** 
  * Asignación por sillón dental (*Box 1, Box 2, etc.*) y por profesional/especialista (Endodoncista, Periodoncista, Ortodoncista).
  * Control de estados de cita: `Programada`, `Confirmada`, `En Sala de Espera`, `En Atención`, `Finalizada`, `No Asistió (No-Show)`.
  * Integración con el Bot de WhatsApp (`dental-ai-agent`) para agendamiento autónomo y recordatorios interactivos.

### Módulo 2: Historia Clínica Odontológica (EHR Core)
* **Ingeniería Inversa:**
  * **Anamnesis completa:** Motivo de consulta, enfermedad actual, antecedentes médicos relevantes (hipertensión, diabetes, alergias a anestésicos como lidocaína, hemorragias, coagulopatías).
  * **Examen estomatológico:** Evaluación de labios, mucosa, paladar, encías, lengua y ATM (Articulación Temporomandibular).
  * **Evoluciones clínicas:** Registro fechado de procedimientos, materiales empleados, indicaciones postoperatorias y firma digital del profesional tratante.

### Módulo 3: Odontograma y Periodontograma Digital
* **Ingeniería Inversa:**
  * Estructura estándar **FDI (Federación Dental Internacional - Código de dos dígitos: 11 al 48 para adultos, 51 al 85 para temporales)**.
  * Mapeo de las 5 caras del diente: Oclusal/Incisal, Vestibular, Mesial, Distal, Lingual/Palatino.
  * Códigos visuales internacionales:
    * 🔴 Rojo: Afección / Tratamiento requerido (Caries, fractura, ausencia).
    * 🔵 Azul: Tratamiento realizado / Buen estado (Resina, corona, endodoncia existente).
  * Periodontograma: Medición de bolsas periodontales, sangrado al sondaje (BOP), movilidad dental y nivel de inserción clínica.

### Módulo 4: Planes de Tratamiento y Presupuestos (Financiero)
* **Ingeniería Inversa:**
  * Conversión automática de diagnósticos del odontograma en ítems de presupuesto.
  * División por fases: Fase Higiénica, Fase Quirúrgica, Fase Restaurativa, Fase de Mantenimiento.
  * Estados de pago: `Presupuestado`, `Aprobado por Paciente`, `En Curso`, `Facturado`.
  * Liquidación a profesionales por porcentaje de producción o tarifa fija.

### Módulo 5: Enlace con Laboratorio Digital 3D (Bioprecisión)
* **Diferenciador Competitivo según Plan de Negocio:**
  * Carga de archivos digitales intraorales (`.STL`, `.OBJ`) y tomografías (`.DICOM`).
  * Emisión de órdenes de trabajo directas al laboratorio para **Alineadores Marca Blanca**, **Guías Quirúrgicas** y **Placas de Bruxismo**.
  * Trazabilidad de tiempos de entrega en 24–72 horas.

### Módulo 6: Cumplimiento Normativo Colombia
* **RIPS (Registro Individual de Prestación de Servicios de Salud):**
  * Generación nativa en formato **JSON** según Resolución 2275 de 2023.
  * Validación de códigos **CUPS** (Clasificación Única de Procedimientos en Salud) y diagnósticos **CIE-10 / CIE-11**.
* **Consentimientos Informados Digitales:** Firma electrónica con valor probatorio conforme a la Ley 527 de 1999.

---

## 2. Esquema de Base de Datos Entidad-Relación (PostgreSQL / Relacional)

* `patients`: Datos demográficos, documento, contacto, tipo de usuario.
* `clinical_records`: Historia clínica, antecedentes patológicos/quirúrgicos/farmacológicos.
* `odontograms`: Versiones de odontograma (Inicial vs Evolución).
* `odontogram_items`: Diente (FDI), cara, afección/procedimiento, estado (rojo/azul).
* `treatment_plans`: Presupuestos, fases, costos, aprobaciones.
* `appointments`: Citas, fecha/hora, box, especialista, estado.
* `rips_records`: Transacciones JSON RIPS validadas para el Ministerio de Salud.
