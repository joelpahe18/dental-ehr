"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const ripsService_js_1 = require("./services/ripsService.js");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3016;
const ripsService = new ripsService_js_1.RipsService();
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.resolve(process.cwd(), 'public')));
// In-Memory Database para prototipado rápido
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
const odontograms = new Map();
const treatmentPlans = new Map();
// Estado de Salud
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        system: 'Dental EHR - Sistema de Historia Clínica Odontológica',
        modules: ['Pacientes', 'Historia Clínica', 'Odontograma FDI', 'Planes de Tratamiento', 'RIPS Res. 2275'],
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
// MÓDULO 2: ODONTOGRAMA FDI INTERACTIVO
// ==========================================
app.get('/api/odontogram/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const odontogram = odontograms.get(patientId) || {
        patientId,
        version: 'inicial',
        updatedAt: new Date().toISOString(),
        teeth: {}
    };
    res.json(odontogram);
});
app.post('/api/odontogram/:patientId', (req, res) => {
    const patientId = String(req.params.patientId);
    const { teeth, version = 'evolucion' } = req.body;
    const updated = {
        patientId,
        version,
        updatedAt: new Date().toISOString(),
        teeth: teeth || {}
    };
    odontograms.set(patientId, updated);
    res.json({ success: true, odontogram: updated });
});
// ==========================================
// MÓDULO 3: PLANES DE TRATAMIENTO Y PRESUPUESTO
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
// MÓDULO 4: GENERACIÓN RIPS JSON (RESOLUCIÓN 2275 COLOMBIA)
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
app.listen(port, () => {
    console.log(`🦷 Dental EHR corriendo en puerto ${port}`);
    console.log(`🔗 Verificación de salud: http://localhost:${port}/health`);
});
