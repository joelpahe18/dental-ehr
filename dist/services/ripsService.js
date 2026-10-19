"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RipsService = void 0;
class RipsService {
    /**
     * Genera la estructura JSON de RIPS según la Resolución 2275 de 2023 de Colombia
     */
    generateRipsJson(params) {
        const { patient, prestadorNit, prestadorCod, numFactura, items } = params;
        const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const procedimientos = items.map((item, idx) => ({
            codPrestador: prestadorCod,
            fechaInicioAtencion: nowIso,
            codProcedimiento: item.cupsCode || '890201', // CUPS Odontología general por defecto
            viaIngresoServicioSalud: '01', // Consulta Externa
            modalidadGrupoServicioTecSal: '01', // Intramural
            grupoServicios: '01', // Consulta Externa
            codServicio: 334, // Servicio de Odontología General / Especializada
            finalidadTecnologiaSalud: '10', // Diagnóstico / Terapéutico
            causaMotivoAtencion: '38', // Enfermedad general
            codDiagnosticoPrincipal: item.cie10Diagnostic || 'K021', // K021: Caries de la dentina
            vrServicio: item.costoCop,
            conceptoRecaudo: '05', // Pago particular / copago
            valorPagoModerador: 0,
            consecutivo: idx + 1
        }));
        return {
            numDocumentoIdObligado: prestadorNit,
            numFactura: numFactura,
            tipoNota: null,
            numNota: null,
            usuarios: [
                {
                    tipoDocumentoIdentificacion: patient.tipoDocumento,
                    numDocumentoIdentificacion: patient.numeroDocumento,
                    tipoUsuario: '01', // Contributivo / Particular
                    fechaNacimiento: patient.fechaNacimiento,
                    codSexo: patient.genero,
                    codPaisResidencia: '170', // Colombia
                    codMunicipioResidencia: '05001', // Medellín
                    codZonaTerritorialResidencia: '01', // Urbana
                    incapacidad: 'NO',
                    consecutivo: 1,
                    servicios: {
                        consultas: [],
                        procedimientos: procedimientos,
                        urgencias: [],
                        hospitalizacion: [],
                        recienNacidos: [],
                        medicamentos: [],
                        otrosServicios: []
                    }
                }
            ]
        };
    }
}
exports.RipsService = RipsService;
