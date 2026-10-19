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
  version: 'inicial' | 'evolucion';
  updatedAt: string;
  teeth: Record<number, ToothCondition[]>; // Llave: Código FDI (11 al 48, 51 al 85)
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
