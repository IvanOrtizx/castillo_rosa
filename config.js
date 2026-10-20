/* ==========================================================
   EL CASTILLO ROSA · NAILS STUDIO — Configuración del negocio
   ----------------------------------------------------------
   API_URL: pega aquí la URL de la app web de Google Apps Script
   (termina en /exec). Si queda vacía, el sitio funciona en
   MODO DEMOSTRACIÓN y guarda los datos solo en este navegador.
   ========================================================== */
window.CR_CONFIG = {
  API_URL: "",

  negocio: {
    nombre: "El Castillo Rosa",
    subtitulo: "Nails Studio",
    whatsapp: "3224195429",
    direccion: "Calle 1 No 10-45 49, Local 1",
    ciudad: "Rivera, Huila",
    instagram: "el_castillo_rosa",
    tiktok: "andreacruznails",
    nequi: "3169801802",
    abonoPct: 20,
    cancelacionHoras: 24
  },

  /* Horario: lunes (1) a sábado (6). Domingo cerrado.
     Festivos: solo jornada de la mañana.
     Cada bloque es [abre, cierra, último turno opcional].
     Con "último turno", la cita puede empezar hasta esa hora aunque
     termine después del cierre. Sin él, la cita debe terminar antes
     de que cierre el bloque (por ejemplo, antes del almuerzo). */
  horario: {
    dias: [1, 2, 3, 4, 5, 6],
    bloques: [["09:00", "12:00"], ["14:00", "18:00", "17:30"]],
    bloquesFestivo: [["09:00", "12:00"]],
    paso: 15,              // minutos entre horas ofrecidas
    diasAdelante: 45,      // hasta cuántos días adelante se puede agendar
    minAnticipacion: 60    // minutos mínimos antes de la cita (el mismo día)
  },

  /* Valores por defecto. Cuando el sistema está conectado a Google
     Sheets, los servicios y el equipo se editan desde el panel. */
  servicios: [
    { id: "soft-gel", nombre: "Soft Gel", cat: "Uñas", precio: 80000, min: 120, ciclo: 25, disenos: true,
      nota: "Efecto acrílico. +$5.000 si el diseño lleva mucha decoración.", foto: "img/disenos/soft-gel-acrilico.jpg" },
    { id: "builder-gel", nombre: "Builder Gel", cat: "Uñas", precio: 70000, min: 90, ciclo: 25, disenos: true,
      nota: "Adicional si hay que pegar alguna uña o el diseño lleva mucha decoración.", foto: "img/disenos/builder-gel.jpg" },
    { id: "base-rubber", nombre: "Base Rubber", cat: "Uñas", precio: 70000, min: 90, ciclo: 25, disenos: true,
      nota: "+$5.000 si hay que pegar uña o el diseño lleva mucha decoración.", foto: "img/disenos/base-rubber.jpg" },
    { id: "semi-manos", nombre: "Semipermanente manos", cat: "Uñas", precio: 55000, min: 60, ciclo: 25, disenos: true,
      nota: "+$5.000 si hay que pegar alguna uña o por diseño.", foto: "img/disenos/semi-manos.jpg" },
    { id: "semi-pies", nombre: "Semipermanente pies", cat: "Uñas", precio: 40000, min: 45, ciclo: 25, disenos: true,
      nota: "+$5.000 si hay que pegar alguna uñita.", foto: "img/disenos/semi-pies.jpg" },
    { id: "trad-manos", nombre: "Manos tradicional", cat: "Uñas", precio: 22000, min: 40, ciclo: 25, disenos: false,
      nota: "Un solo tono o francés.", foto: "" },
    { id: "trad-pies", nombre: "Pies tradicional", cat: "Uñas", precio: 22000, min: 35, ciclo: 25, disenos: false,
      nota: "Un solo tono o francés.", foto: "img/disenos/tradicional-pies.jpg" },
    { id: "semi-caballero", nombre: "Semipermanente caballero", cat: "Uñas", precio: 30000, min: 35, ciclo: 25, disenos: false,
      nota: "Semipermanente normal.", foto: "" },
    { id: "laminado", nombre: "Laminado de cejas", cat: "Cejas y pestañas", precio: 45000, min: 45, ciclo: 30, disenos: false,
      nota: "Se recomienda volver cada mes.", foto: "img/disenos/laminado-henna.jpg" },
    { id: "lifting", nombre: "Lifting de pestañas", cat: "Cejas y pestañas", precio: 45000, min: 50, ciclo: 60, disenos: false,
      nota: "Se recomienda volver cada 2 meses.", foto: "img/disenos/laminado-lifting.jpg" },
    { id: "depilacion-henna", nombre: "Depilación de cejas + diseño en henna", cat: "Cejas y pestañas", precio: 28000, min: 30, ciclo: 15, disenos: false,
      nota: "Se recomienda volver cada 15 días.", foto: "img/disenos/depilacion-henna.jpg" }
  ],

  /* Retiro de uñas: se suma como adicional a la cita. */
  retiros: [
    { id: "", nombre: "No necesito retiro", precio: 0, min: 0 },
    { id: "retiro-nuestro", nombre: "Retiro de nuestro salón", precio: 5000, min: 15 },
    { id: "retiro-otro", nombre: "Retiro de otro salón", precio: 10000, min: 15 }
  ],

  equipo: [
    { id: "andrea", nombre: "Andrea Cruz", dias: [1, 2, 3, 4, 5, 6], activa: true },
    { id: "fernanda", nombre: "Fernanda Perdomo", dias: [1, 2, 3, 4, 5, 6], activa: true },
    { id: "valentina", nombre: "Valentina Chala", dias: [1, 2, 3, 4, 5, 6], activa: true },
    { id: "claudia", nombre: "Claudia Cortez", dias: [1, 2, 3, 4, 5, 6], activa: true }
  ],

  /* Catálogo de diseños que la clienta puede escoger (uñas). */
  disenos: [
    { id: "d-soft-acrilico", nombre: "Soft gel efecto acrílico", foto: "img/disenos/soft-gel-acrilico.jpg", deco: true },
    { id: "d-soft-flores", nombre: "Lunares y flores 3D", foto: "img/disenos/soft-gel-flores.jpg", deco: true },
    { id: "d-soft-coral", nombre: "Coral con moños", foto: "img/disenos/soft-gel-coral.jpg", deco: true },
    { id: "d-builder", nombre: "Nude con piedras", foto: "img/disenos/builder-gel.jpg", deco: false },
    { id: "d-rubber", nombre: "Degradé amarillo", foto: "img/disenos/base-rubber.jpg", deco: false },
    { id: "d-semi-frances", nombre: "Francés clásico", foto: "img/disenos/semi-manos.jpg", deco: false },
    { id: "d-pies-frances", nombre: "Francés rosa con brillo (pies)", foto: "img/disenos/semi-pies.jpg", deco: false },
    { id: "d-pies-nude", nombre: "Nude un solo tono (pies)", foto: "img/disenos/tradicional-pies.jpg", deco: false }
  ]
};
