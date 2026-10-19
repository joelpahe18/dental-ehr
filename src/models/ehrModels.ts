export interface Patient {
  id: string;
  tipoDocumento: 'CC' | 'TI' | 'CE' | 'PAS' | 'RC';
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: 'M' | 'F' | 'OTRO';
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  epsAseguradora: string;
  contactoEmergencia: {
    nombre: string;
    parentesco: string;
    telefono: string;
  };
}

// ==========================================
// MÓDULO DE AGENDA Y CITAS CLÍNICAS (BOXES)
// ==========================================
export type AppointmentStatus = 
  | 'programada'
  | 'confirmada_whatsapp'
  | 'en_sala_espera'
  | 'en_atencion'
  | 'finalizada'
  | 'no_asistio';

export interface DentalAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  especialista: string;
  boxSillon: string; // ej. "Box 1 - Sillón Principal", "Box 2 - Cirugía"
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  duracionMinutos: number;
  motivoConsulta: string;
  estado: AppointmentStatus;
  origen: 'whatsapp_ia' | 'recepcion_presencial' | 'pagina_web';
  notas?: string;
}

export interface MedicalBackground {
  hipertension: boolean;
  diabetes: boolean;
  enfermedadesCardiacas: boolean;
  alergiasAnestesicos: boolean;
  alergiasMedicamentos: string[];
  coagulopatiasSangrado: boolean;
  embarazoLactancia: boolean;
  medicamentosActuales: string[];
  observaciones: string;
}

export type ToothSurface = 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal';

export interface ToothCondition {
  surface?: ToothSurface;
  condition: 'caries' | 'obturacion' | 'fractura' | 'ausente' | 'endodoncia' | 'corona' | 'implante' | 'sano';
  status: 'requerido' | 'realizado'; // Rojo vs Azul
  cupsCode?: string;
  observacion?: string;
}

export interface OdontogramState {
  patientId: string;
  dentitionType: 'permanente' | 'temporal' | 'mixta';
  version: 'inicial' | 'evolucion';
  updatedAt: string;
  teeth: Record<number, ToothCondition[]>; // Llave: Código FDI (11 al 48 para adulto, 51 al 85 para temporal)
}

// ==========================================
// MÓDULO DE PERIODONTOGRAMA (Sondaje en 6 puntos)
// ==========================================
export interface ToothPerioMeasurement {
  dienteFdi: number;
  sondajeVestibular: [number, number, number];
  margenVestibular: [number, number, number];
  sangradoVestibular: [boolean, boolean, boolean];
  sondajeLingual: [number, number, number];
  margenLingual: [number, number, number];
  sangradoLingual: [boolean, boolean, boolean];
  movilidad: 0 | 1 | 2 | 3;
  furca?: 0 | 1 | 2 | 3 | 4;
  placaBacteriana: boolean;
  ausente: boolean;
}

export interface PeriodontogramState {
  patientId: string;
  fecha: string;
  periodoncista: string;
  porcentajeSangradoBop: number;
  sitiosConBolsaMayor4mm: number;
  measurements: Record<number, ToothPerioMeasurement>;
}

// ==========================================
// MÓDULO DE CONSENTIMIENTOS INFORMADOS (Ley 527 Colombia)
// ==========================================
export interface InformedConsent {
  id: string;
  patientId: string;
  tipoProcedimiento: 'Cirugía de Implantes' | 'Ortodoncia Invisible 3D' | 'Exodoncia Quirúrgica' | 'Endodoncia' | 'Aclaramiento Dental';
  contenidoTexto: string;
  riesgosInformados: string[];
  fechaHoraFirma: string;
  firmaDigitalBase64: string;
  ipFirma?: string;
  hashIntegridad: string;
}

export interface TreatmentPlanItem {
  id: string;
  dienteFdi?: number;
  fase: 'higienica' | 'quirurgica' | 'restaurativa' | 'mantenimiento';
  procedimiento: string;
  cupsCode: string;
  cie10Diagnostic: string;
  costoCop: number;
  estado: 'presupuestado' | 'aprobado' | 'en_curso' | 'finalizado';
}

export interface ClinicalEvolution {
  id: string;
  patientId: string;
  fecha: string;
  odontologo: string;
  motivoEvolucion: string;
  procedimientoRealizado: string;
  anestesiaUtilizada?: string;
  indicacionesPostoperatorias: string;
  firmaProfesional: string;
}
