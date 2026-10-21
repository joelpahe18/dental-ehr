"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const ripsService_js_1 = require("./services/ripsService.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3016;
const ripsService = new ripsService_js_1.RipsService();
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.static(path_1.default.resolve(process.cwd(), 'public')));
// Base de Datos en Memoria para desarrollo ágil
const patients = new Map([
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
const appointments = new Map([
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
const odontograms = new Map();
const periodontograms = new Map();
const informedConsents = new Map();
const treatmentPlans = new Map();
// In-Memory Evoluciones Clínicas
const clinicalEvolutions = new Map([
    [
        '1',
        [
            {
                id: 'evo-1',
                patientId: '1',
                fecha: '2026-10-15 10:30',
                odontologo: 'Dr. Alejandro Restrepo',
                especialidad: 'Ortodoncia Digital',
                motivoEvolucion: 'Control de Alineador #3',
                procedimientoRealizado: 'Verificación de ataches vestibulares. Buen tracking dental. Se entrega kit de alineadores #4 y #5 con láminas Taglus de bioprecisión.',
                indicacionesPostoperatorias: 'Uso estricto de 22 horas diarias. Retirar solo para comer y cepillarse.',
                firmaProfesional: 'Dr. Alejandro Restrepo - Reg. Med. 05-4921'
            },
            {
                id: 'evo-2',
                patientId: '1',
                fecha: '2026-09-20 09:00',
                odontologo: 'Dra. Claudia Mejía',
                especialidad: 'Implantología Oral',
                motivoEvolucion: 'Cirugía Guiada Molar 16',
                procedimientoRealizado: 'Colocación de implante de titanio guiado por tomografía 3D (CBCT + STL). Sin colgajo extenso, ajuste milimétrico mediante casquillo.',
                anestesiaUtilizada: 'Lidocaína 2% con epinefrina (2 cárpules)',
                indicacionesPostoperatorias: 'Gasa de compresión por 45 minutos. Frío local 15 min on/off las primeras 24 horas. Dieta blanda.',
                firmaProfesional: 'Dra. Claudia Mejía - Reg. Med. 05-8832',
                dienteFdi: 16
            }
        ]
    ]
]);
// In-Memory Galería Fotográfica Clínica
const clinicalPhotos = new Map([
    [
        '1',
        [
            {
                id: 'photo-1',
                patientId: '1',
                fecha: '2026-08-01',
                tipo: 'inicial_antes',
                angulo: 'frontal_sonrisa',
                url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
                notas: 'Estado inicial previo a alineadores (apiñamiento anteroinferior)'
            },
            {
                id: 'photo-2',
                patientId: '1',
                fecha: '2026-10-15',
                tipo: 'progreso',
                angulo: 'frontal_sonrisa',
                url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80',
                notas: 'Avance tras 2 meses con alineadores (expansión y nivelación lograda)'
            }
        ]
    ]
]);
// Estado de Salud
app.get('/health', (req, res) => {
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
app.get('/api/patients', (req, res) => {
    res.json(Array.from(patients.values()));
});
app.post('/api/patients', (req, res) => {
    const patientData = req.body;
    const id = patientData.id || String(patients.size + 1);
    const newPatient = { ...patientData, id };
    patients.set(id, newPatient);
    res.status(201).json(newPatient);
});
// ==========================================
// MÓDULO 2: ODONTOGRAMA FDI (ADULTO / INFANTIL)
// ==========================================
app.get('/api/odontogram/:patientId', (req, res) => {
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
app.post('/api/odontogram/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const { teeth, dentitionType = 'permanente', version = 'evolucion' } = req.body;
    const updated = {
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
app.get('/api/periodontogram/:patientId', (req, res) => {
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
app.post('/api/periodontogram/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const { measurements, periodoncista = 'Especialista' } = req.body;
    let totalPuntos = 0;
    let puntosSangrado = 0;
    let bolsasPeligro = 0;
    Object.values(measurements || {}).forEach((m) => {
        if (!m.ausente) {
            // 6 puntos de sondaje
            const allSondaje = [...(m.sondajeVestibular || []), ...(m.sondajeLingual || [])];
            const allBop = [...(m.sangradoVestibular || []), ...(m.sangradoLingual || [])];
            allSondaje.forEach(s => {
                totalPuntos++;
                if (s >= 4)
                    bolsasPeligro++;
            });
            allBop.forEach(b => {
                if (b)
                    puntosSangrado++;
            });
        }
    });
    const porcentajeSangradoBop = totalPuntos > 0 ? Math.round((puntosSangrado / totalPuntos) * 100) : 0;
    const perioState = {
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
app.get('/api/consents/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const list = informedConsents.get(patientId) || [];
    res.json(list);
});
app.post('/api/consents/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const { tipoProcedimiento, contenidoTexto, riesgosInformados, firmaDigitalBase64 } = req.body;
    if (!firmaDigitalBase64) {
        res.status(400).json({ error: 'La firma digital es obligatoria.' });
        return;
    }
    // Generar Hash criptográfico SHA-256 para garantizar la integridad legal del consentimiento
    const rawPayload = `${patientId}|${tipoProcedimiento}|${contenidoTexto}|${firmaDigitalBase64}`;
    const hashIntegridad = crypto_1.default.createHash('sha256').update(rawPayload).digest('hex');
    const consent = {
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
app.get('/api/treatment-plans/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const plan = treatmentPlans.get(patientId) || [];
    res.json(plan);
});
app.post('/api/treatment-plans/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const { items } = req.body;
    treatmentPlans.set(patientId, items);
    res.json({ success: true, count: items.length });
});
// ==========================================
// MÓDULO 6: GENERACIÓN RIPS JSON (RESOLUCIÓN 2275 COLOMBIA)
// ==========================================
app.get('/api/rips/generate/:patientId', (req, res) => {
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
app.get('/api/appointments', (req, res) => {
    res.json(Array.from(appointments.values()));
});
app.post('/api/appointments', (req, res) => {
    const data = req.body;
    const id = data.id || `apt-${Date.now()}`;
    const newAppointment = {
        ...data,
        id,
        estado: data.estado || 'programada',
        origen: data.origen || 'recepcion_presencial'
    };
    appointments.set(id, newAppointment);
    res.status(201).json({ success: true, appointment: newAppointment });
});
app.patch('/api/appointments/:id/status', (req, res) => {
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
// ==========================================
// MÓDULO 8: EVOLUCIONES CLÍNICAS & TIMELINE INTERACTIVO
// ==========================================
app.get('/api/evolutions/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const evos = clinicalEvolutions.get(patientId) || [];
    res.json(evos);
});
app.post('/api/evolutions/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const data = req.body;
    const newEvo = {
        id: `evo-${Date.now()}`,
        patientId,
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
        odontologo: data.odontologo || 'Dr. Alejandro Restrepo',
        especialidad: data.especialidad || 'Odontología General',
        motivoEvolucion: data.motivoEvolucion || 'Control clínico',
        procedimientoRealizado: data.procedimientoRealizado || '',
        anestesiaUtilizada: data.anestesiaUtilizada,
        indicacionesPostoperatorias: data.indicacionesPostoperatorias || '',
        firmaProfesional: data.firmaProfesional || 'Dr. Tratante - Reg. Med. 05-4921',
        dienteFdi: data.dienteFdi
    };
    const list = clinicalEvolutions.get(patientId) || [];
    list.unshift(newEvo);
    clinicalEvolutions.set(patientId, list);
    res.status(201).json({ success: true, evolution: newEvo });
});
// Endpoint unificado de Timeline (Citas, Evoluciones, Consentimientos)
app.get('/api/timeline/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const timeline = [];
    // Evoluciones
    const evos = clinicalEvolutions.get(patientId) || [];
    evos.forEach(e => {
        timeline.push({
            id: e.id,
            tipo: 'evolucion',
            titulo: `${e.motivoEvolucion} ${e.dienteFdi ? `(Pieza ${e.dienteFdi})` : ''}`,
            descripcion: e.procedimientoRealizado,
            fecha: e.fecha,
            profesional: `${e.odontologo} (${e.especialidad})`,
            icono: '🩺',
            colorBadge: '#0284c7',
            detallesExtra: {
                anestesia: e.anestesiaUtilizada,
                postop: e.indicacionesPostoperatorias
            }
        });
    });
    // Citas agendadas
    const apts = Array.from(appointments.values()).filter(a => a.patientId === patientId);
    apts.forEach(a => {
        timeline.push({
            id: a.id,
            tipo: 'cita',
            titulo: `Cita: ${a.motivoConsulta}`,
            descripcion: `Sillón: ${a.boxSillon} • Estado: ${a.estado.replace('_', ' ').toUpperCase()}`,
            fecha: `${a.fecha} ${a.horaInicio}`,
            profesional: a.especialista,
            icono: '📅',
            colorBadge: a.estado === 'confirmada_whatsapp' ? '#16a34a' : '#eab308'
        });
    });
    // Consentimientos
    const consents = informedConsents.get(patientId) || [];
    consents.forEach(c => {
        timeline.push({
            id: c.id,
            tipo: 'consentimiento',
            titulo: `Consentimiento Firmado: ${c.tipoProcedimiento}`,
            descripcion: `Sello digital de integridad SHA-256: ${c.hashIntegridad.substring(0, 16)}...`,
            fecha: c.fechaHoraFirma.replace('T', ' ').substring(0, 16),
            icono: '✍️',
            colorBadge: '#8b5cf6'
        });
    });
    // Ordenar de más reciente a más antiguo
    timeline.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    res.json(timeline);
});
// ==========================================
// MÓDULO 9: GALERÍA FOTOGRÁFICA CLÍNICA
// ==========================================
app.get('/api/photos/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const photos = clinicalPhotos.get(patientId) || [];
    res.json(photos);
});
// Endpoint para vincular hallazgo de odontograma con plan de tratamiento
app.post('/api/quick-procedure', (req, res) => {
    const { patientId, dienteFdi, procedimiento, cupsCode, cie10Diagnostic, costoCop } = req.body;
    const list = treatmentPlans.get(String(patientId)) || [];
    const newItem = {
        id: `item-${Date.now()}`,
        dienteFdi: Number(dienteFdi),
        fase: 'restaurativa',
        procedimiento: procedimiento || 'Procedimiento Odontológico',
        cupsCode: cupsCode || '232101',
        cie10Diagnostic: cie10Diagnostic || 'K021',
        costoCop: Number(costoCop) || 140000,
        estado: 'presupuestado'
    };
    list.push(newItem);
    treatmentPlans.set(String(patientId), list);
    res.status(201).json({ success: true, item: newItem, totalCount: list.length });
});
app.listen(port, () => {
    console.log(`🦷 Dental EHR corriendo en puerto ${port}`);
    console.log(`🔗 Verificación de salud: http://localhost:${port}/health`);
});
