import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { 
  Patient, 
  DentalAppointment,
  OdontogramState, 
  PeriodontogramState, 
  InformedConsent, 
  TreatmentPlanItem 
} from './models/ehrModels.js';
import { RipsService } from './services/ripsService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3016;
const ripsService = new RipsService();

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Base de Datos en Memoria para desarrollo ágil
const patients: Map<string, Patient> = new Map([
  [
    '1',
    {
      id: '1',
      tipoDocumento: 'CC',
      numeroDocumento: '1020304050',
      nombres: 'Joel David',
      apellidos: 'Payares Hernández',
      fechaNacimiento: '1996-05-18',
      genero: 'M',
      telefono: '+573001234567',
      email: 'joel@ejemplo.com',
      direccion: 'Cra 43A # 1-50, El Poblado',
      ciudad: 'Medellín',
      epsAseguradora: 'Sura',
      contactoEmergencia: {
        nombre: 'Familiar',
        parentesco: 'Hermano',
        telefono: '+573009876543'
      }
    }
  ]
]);

const appointments: Map<string, DentalAppointment> = new Map([
  [
    'apt-1',
    {
      id: 'apt-1',
      patientId: '1',
      patientName: 'Joel David Payares',
      patientPhone: '+573001234567',
      especialista: 'Dr. Alejandro Restrepo (Ortodoncista)',
      boxSillon: 'Box 1 - Escáner 3D',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '09:00',
      duracionMinutos: 45,
      motivoConsulta: 'Valoración Escaneo 3D para Alineadores',
      estado: 'confirmada_whatsapp',
      origen: 'whatsapp_ia',
      notas: 'Cita agendada de forma autónoma por Sofía (Dental AI Agent)'
    }
  ],
  [
    'apt-2',
    {
      id: 'apt-2',
      patientId: '2',
      patientName: 'Mariana Gomez',
      patientPhone: '+573119876543',
      especialista: 'Dra. Claudia Mejía (Periodoncista)',
      boxSillon: 'Box 2 - Quirófano Oral',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '11:00',
      duracionMinutos: 60,
      motivoConsulta: 'Mantenimiento Periodontal y Sondaje',
      estado: 'en_sala_espera',
      origen: 'recepcion_presencial',
      notas: 'Paciente en sala de espera'
    }
  ]
]);

const odontograms: Map<string, OdontogramState> = new Map();
const periodontograms: Map<string, PeriodontogramState> = new Map();
const informedConsents: Map<string, InformedConsent[]> = new Map();
const treatmentPlans: Map<string, TreatmentPlanItem[]> = new Map();

// Estado de Salud
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'Dental EHR - Sistema Clínico Odontológico',
    modules: [
      'Pacientes', 
      'Odontograma Mixto (Adulto e Infantil)', 
      'Periodontograma Digital (NIC, BOP, Furcas)', 
      'Consentimientos Digitales (Ley 527)',
      'Planes de Tratamiento', 
      'RIPS Res. 2275'
    ],
    port,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// MÓDULO 1: PACIENTES
// ==========================================
app.get('/api/patients', (req: Request, res: Response) => {
  res.json(Array.from(patients.values()));
});

app.post('/api/patients', (req: Request, res: Response) => {
  const patientData = req.body as Patient;
  const id = patientData.id || String(patients.size + 1);
  const newPatient = { ...patientData, id };
  patients.set(id, newPatient);
  res.status(201).json(newPatient);
});

// ==========================================
// MÓDULO 2: ODONTOGRAMA FDI (ADULTO / INFANTIL)
// ==========================================
app.get('/api/odontogram/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const odontogram = odontograms.get(patientId) || {
    patientId,
    dentitionType: 'permanente',
    version: 'inicial',
    updatedAt: new Date().toISOString(),
    teeth: {}
  };
  res.json(odontogram);
});

app.post('/api/odontogram/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const { teeth, dentitionType = 'permanente', version = 'evolucion' } = req.body;

  const updated: OdontogramState = {
    patientId,
    dentitionType,
    version,
    updatedAt: new Date().toISOString(),
    teeth: teeth || {}
  };

  odontograms.set(patientId, updated);
  res.json({ success: true, odontogram: updated });
});

// ==========================================
// MÓDULO 3: PERIODONTOGRAMA DIGITAL (SONDAJE 6 PUNTOS)
// ==========================================
app.get('/api/periodontogram/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const perio = periodontograms.get(patientId) || {
    patientId,
    fecha: new Date().toISOString().split('T')[0],
    periodoncista: 'Dra. Especialista en Periodoncia',
    porcentajeSangradoBop: 12.5,
    sitiosConBolsaMayor4mm: 3,
    measurements: {
      16: {
        dienteFdi: 16,
        sondajeVestibular: [3, 2, 5], // 5 mm bolsa en distal
        margenVestibular: [0, 0, 1],
        sangradoVestibular: [false, false, true], // sangrado en distal
        sondajeLingual: [2, 2, 3],
        margenLingual: [0, 0, 0],
        sangradoLingual: [false, false, false],
        movilidad: 1,
        furca: 1,
        placaBacteriana: true,
        ausente: false
      }
    }
  };
  res.json(perio);
});

app.post('/api/periodontogram/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const { measurements, periodoncista = 'Especialista' } = req.body;

  let totalPuntos = 0;
  let puntosSangrado = 0;
  let bolsasPeligro = 0;

  Object.values(measurements || {}).forEach((m: any) => {
    if (!m.ausente) {
      // 6 puntos de sondaje
      const allSondaje = [...(m.sondajeVestibular || []), ...(m.sondajeLingual || [])];
      const allBop = [...(m.sangradoVestibular || []), ...(m.sangradoLingual || [])];

      allSondaje.forEach(s => {
        totalPuntos++;
        if (s >= 4) bolsasPeligro++;
      });

      allBop.forEach(b => {
        if (b) puntosSangrado++;
      });
    }
  });

  const porcentajeSangradoBop = totalPuntos > 0 ? Math.round((puntosSangrado / totalPuntos) * 100) : 0;

  const perioState: PeriodontogramState = {
    patientId,
    fecha: new Date().toISOString().split('T')[0],
    periodoncista,
    porcentajeSangradoBop,
    sitiosConBolsaMayor4mm: bolsasPeligro,
    measurements: measurements || {}
  };

  periodontograms.set(patientId, perioState);
  res.json({ success: true, periodontogram: perioState });
});

// ==========================================
// MÓDULO 4: CONSENTIMIENTO INFORMADO & FIRMA DIGITAL (LEY 527)
// ==========================================
app.get('/api/consents/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const list = informedConsents.get(patientId) || [];
  res.json(list);
});

app.post('/api/consents/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const { tipoProcedimiento, contenidoTexto, riesgosInformados, firmaDigitalBase64 } = req.body;

  if (!firmaDigitalBase64) {
    res.status(400).json({ error: 'La firma digital es obligatoria.' });
    return;
  }

  // Generar Hash criptográfico SHA-256 para garantizar la integridad legal del consentimiento
  const rawPayload = `${patientId}|${tipoProcedimiento}|${contenidoTexto}|${firmaDigitalBase64}`;
  const hashIntegridad = crypto.createHash('sha256').update(rawPayload).digest('hex');

  const consent: InformedConsent = {
    id: `consent-${Date.now()}`,
    patientId,
    tipoProcedimiento: tipoProcedimiento || 'Cirugía de Implantes',
    contenidoTexto: contenidoTexto || 'Autorizo de manera libre e informada la realización del procedimiento.',
    riesgosInformados: riesgosInformados || ['Inflamación local', 'Molestias postoperatorias leves'],
    fechaHoraFirma: new Date().toISOString(),
    firmaDigitalBase64,
    hashIntegridad
  };

  const existing = informedConsents.get(patientId) || [];
  existing.push(consent);
  informedConsents.set(patientId, existing);

  res.status(201).json({ success: true, consent });
});

// ==========================================
// MÓDULO 5: PLANES DE TRATAMIENTO Y PRESUPUESTO
// ==========================================
app.get('/api/treatment-plans/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const plan = treatmentPlans.get(patientId) || [];
  res.json(plan);
});

app.post('/api/treatment-plans/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const { items } = req.body;
  treatmentPlans.set(patientId, items);
  res.json({ success: true, count: items.length });
});

// ==========================================
// MÓDULO 6: GENERACIÓN RIPS JSON (RESOLUCIÓN 2275 COLOMBIA)
// ==========================================
app.get('/api/rips/generate/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const patient = patients.get(patientId);
  const items = treatmentPlans.get(patientId) || [
    {
      id: 'item-1',
      dienteFdi: 16,
      fase: 'restaurativa',
      procedimiento: 'Obturación dental con resina de fotocurado',
      cupsCode: '232101',
      cie10Diagnostic: 'K021',
      costoCop: 140000,
      estado: 'finalizado'
    }
  ];

  if (!patient) {
    res.status(404).json({ error: 'Paciente no encontrado' });
    return;
  }

  const ripsJson = ripsService.generateRipsJson({
    patient,
    prestadorNit: '901234567-8',
    prestadorCod: '050010123401',
    numFactura: 'FEV-1024',
    items
  });

  res.json(ripsJson);
});

// ==========================================
// MÓDULO 7: AGENDAMIENTO & CONTROL DE BOXES
// ==========================================
app.get('/api/appointments', (req: Request, res: Response) => {
  res.json(Array.from(appointments.values()));
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const data = req.body as DentalAppointment;
  const id = data.id || `apt-${Date.now()}`;
  const newAppointment: DentalAppointment = {
    ...data,
    id,
    estado: data.estado || 'programada',
    origen: data.origen || 'recepcion_presencial'
  };
  appointments.set(id, newAppointment);
  res.status(201).json({ success: true, appointment: newAppointment });
});

app.patch('/api/appointments/:id/status', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { estado } = req.body;
  const existing = appointments.get(id);
  if (!existing) {
    res.status(404).json({ error: 'Cita no encontrada' });
    return;
  }
  existing.estado = estado;
  appointments.set(id, existing);
  res.json({ success: true, appointment: existing });
});

app.listen(port, () => {
  console.log(`🦷 Dental EHR corriendo en puerto ${port}`);
  console.log(`🔗 Verificación de salud: http://localhost:${port}/health`);
});
