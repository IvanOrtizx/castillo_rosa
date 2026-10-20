/* El Castillo Rosa — lógica compartida (fechas, horarios, datos) */
(function () {
  const C = window.CR_CONFIG;
  const CR = (window.CR = {});

  /* ---------- utilidades ---------- */
  CR.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  CR.money = (n) => "$" + Math.round(n || 0).toLocaleString("es-CO");
  CR.dur = (m) => { const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${r} min`; };
  CR.pad = (n) => String(n).padStart(2, "0");
  CR.toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  CR.toHHMM = (m) => CR.pad(Math.floor(m / 60)) + ":" + CR.pad(m % 60);
  CR.hora12 = (hhmm) => { let [h, m] = hhmm.split(":").map(Number); const p = h >= 12 ? "p. m." : "a. m."; h = h % 12 || 12; return `${h}:${CR.pad(m)} ${p}`; };
  CR.ymd = (d) => `${d.getFullYear()}-${CR.pad(d.getMonth() + 1)}-${CR.pad(d.getDate())}`;
  CR.parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  CR.addDays = (s, n) => { const d = CR.parse(s); d.setDate(d.getDate() + n); return CR.ymd(d); };
  CR.diffDays = (a, b) => Math.round((CR.parse(b) - CR.parse(a)) / 86400000);
  CR.hoy = () => CR.ymd(new Date());
  CR.ahoraMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  CR.DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  CR.DIAS_C = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  CR.MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  CR.fechaLarga = (s) => { const d = CR.parse(s); return `${CR.DIAS[d.getDay()]} ${d.getDate()} de ${CR.MESES[d.getMonth()]}`; };
  CR.fechaCorta = (s) => { const d = CR.parse(s); return `${d.getDate()} ${CR.MESES[d.getMonth()].slice(0, 3)}`; };
  CR.tel = (t) => String(t || "").replace(/\D/g, "").replace(/^57(?=\d{10}$)/, "").slice(-10);
  CR.wa = (num, texto) => `https://wa.me/57${CR.tel(num)}?text=${encodeURIComponent(texto || "")}`;
  CR.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  CR.primerNombre = (n) => String(n || "").trim().split(/\s+/)[0] || "";

  /* ---------- festivos de Colombia (Ley Emiliani) ---------- */
  function pascua(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mes - 1, dia);
  }
  const lunes = (d) => { const x = new Date(d); while (x.getDay() !== 1) x.setDate(x.getDate() + 1); return x; };
  const cache = {};
  CR.festivos = function (y) {
    if (cache[y]) return cache[y];
    const out = {};
    const add = (d, n) => (out[CR.ymd(d)] = n);
    add(new Date(y, 0, 1), "Año Nuevo"); add(new Date(y, 4, 1), "Día del Trabajo");
    add(new Date(y, 6, 20), "Independencia"); add(new Date(y, 7, 7), "Batalla de Boyacá");
    add(new Date(y, 11, 8), "Inmaculada Concepción"); add(new Date(y, 11, 25), "Navidad");
    [[0, 6, "Reyes Magos"], [2, 19, "San José"], [5, 29, "San Pedro y San Pablo"], [7, 15, "Asunción"],
     [9, 12, "Día de la Raza"], [10, 1, "Todos los Santos"], [10, 11, "Independencia de Cartagena"]]
      .forEach(([m, d, n]) => add(lunes(new Date(y, m, d)), n));
    const p = pascua(y), off = (n) => { const x = new Date(p); x.setDate(x.getDate() + n); return x; };
    add(off(-3), "Jueves Santo"); add(off(-2), "Viernes Santo");
    add(off(43), "Ascensión del Señor"); add(off(64), "Corpus Christi"); add(off(71), "Sagrado Corazón");
    return (cache[y] = out);
  };
  CR.festivo = (s) => CR.festivos(+s.slice(0, 4))[s] || null;

  /* ---------- horario del día ---------- */
  CR.bloquesDelDia = function (s) {
    const d = CR.parse(s);
    if (!C.horario.dias.includes(d.getDay())) return [];
    return (CR.festivo(s) ? C.horario.bloquesFestivo : C.horario.bloques).map(([a, b, u]) => [CR.toMin(a), CR.toMin(b), u ? CR.toMin(u) : null]);
  };

  /* ---------- catálogo (puede venir del servidor) ---------- */
  CR.cat = { servicios: C.servicios.map((s) => ({ activo: true, ...s })), equipo: C.equipo, disenos: C.disenos, retiros: C.retiros };
  CR.servicio = (id) => CR.cat.servicios.find((s) => s.id === id);
  CR.miembro = (id) => CR.cat.equipo.find((e) => e.id === id);
  CR.diseno = (id) => CR.cat.disenos.find((d) => d.id === id);
  CR.retiro = (id) => CR.cat.retiros.find((r) => r.id === id) || CR.cat.retiros[0];

  CR.calcular = function (servIds, retiroId) {
    let precio = 0, min = 0;
    servIds.forEach((id) => { const s = CR.servicio(id); if (s) { precio += +s.precio; min += +s.min; } });
    const r = CR.retiro(retiroId); if (r) { precio += r.precio; min += r.min; }
    return { precio, min, abono: Math.round((precio * C.negocio.abonoPct) / 100 / 100) * 100 };
  };
  CR.nombresServicios = (ids) => (ids || []).map((id) => (CR.servicio(id) || { nombre: id }).nombre).join(" + ");

  /* ---------- disponibilidad ----------
     ocupado: [{fecha, hora, min, staff}] (sin canceladas) */
  CR.ACTIVAS = ["pendiente", "confirmada", "atendida", "bloqueo"];
  CR.libre = function (ocupado, fecha, staff, ini, fin, ignorarId) {
    return !ocupado.some((o) => o.fecha === fecha && o.staff === staff && (!ignorarId || o.id !== ignorarId) &&
      ini < CR.toMin(o.hora) + +o.min && CR.toMin(o.hora) < fin);
  };
  CR.trabaja = (m, fecha) => m && m.activa !== false && (m.dias || []).includes(CR.parse(fecha).getDay());

  /* Devuelve [{hora, libres:[staffIds]}] para cada hora de inicio posible */
  CR.horarios = function (fecha, durMin, ocupado, opts = {}) {
    const bloques = CR.bloquesDelDia(fecha);
    const equipo = CR.cat.equipo.filter((m) => CR.trabaja(m, fecha));
    const paso = C.horario.paso, out = [];
    const limite = fecha === CR.hoy() && !opts.admin ? CR.ahoraMin() + C.horario.minAnticipacion : -1;
    bloques.forEach(([a, b, ultimo]) => {
      for (let t = a; ultimo != null ? t <= ultimo : t + durMin <= b; t += paso) {
        if (t < limite) continue;
        const libres = equipo.filter((m) => CR.libre(ocupado, fecha, m.id, t, t + durMin, opts.ignorarId)).map((m) => m.id);
        out.push({ hora: CR.toHHMM(t), libres });
      }
    });
    return out;
  };
  /* Al elegir "la que esté disponible": la que tenga menos minutos agendados ese día */
  CR.asignar = function (libres, fecha, ocupado) {
    const carga = (id) => ocupado.filter((o) => o.fecha === fecha && o.staff === id).reduce((s, o) => s + +o.min, 0);
    return libres.slice().sort((x, y) => carga(x) - carga(y))[0];
  };

  /* ---------- retoques ---------- */
  /* Para cada clienta: por cada servicio, su última visita atendida y cuándo le toca volver */
  CR.clientas = function (citas) {
    const map = {};
    citas.filter((c) => c.estado !== "bloqueo").forEach((c) => {
      const t = CR.tel(c.telefono); if (!t) return;
      const k = (map[t] = map[t] || { telefono: t, nombre: c.nombre, citas: [], gastado: 0, visitas: 0, ultima: "", primera: c.fecha, ultimos: {} });
      k.citas.push(c);
      if (c.fecha < k.primera) k.primera = c.fecha;
      if (c.estado === "atendida") {
        k.visitas++; k.gastado += +(c.cobrado || c.total || 0);
        if (c.fecha >= k.ultima) { k.ultima = c.fecha; k.nombre = c.nombre || k.nombre; }
        (c.servicios || []).forEach((id) => { if (!k.ultimos[id] || k.ultimos[id] < c.fecha) k.ultimos[id] = c.fecha; });
      }
    });
    const hoy = CR.hoy();
    Object.values(map).forEach((k) => {
      k.citas.sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1));
      k.proxima = k.citas.filter((c) => c.fecha >= hoy && ["pendiente", "confirmada"].includes(c.estado)).pop() || null;
      // retoque: el servicio cuyo regreso está más cerca
      let ret = null;
      Object.entries(k.ultimos).forEach(([id, f]) => {
        const s = CR.servicio(id); if (!s || !s.ciclo) return;
        const vence = CR.addDays(f, +s.ciclo);
        if (!ret || vence < ret.vence) ret = { servicio: id, desde: f, vence, dias: CR.diffDays(hoy, vence) };
      });
      k.retoque = ret;
    });
    return Object.values(map);
  };

  /* ---------- capa de datos ---------- */
  const API = C.API_URL && C.API_URL.trim();
  CR.demo = !API;

  async function remoto(accion, datos, pin) {
    const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ accion, datos, pin }) });
    const j = await r.json();
    if (j.error) { const e = new Error(j.mensaje || j.error); e.code = j.error; throw e; }
    return j;
  }

  /* --- modo demostración: localStorage + datos de ejemplo --- */
  const KEY = "castillo_rosa_demo_v1";
  function leer() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    if (!d) { d = semilla(); guardar(d); }
    return d;
  }
  function guardar(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} CR._mem = d; }
  function semilla() {
    const nombres = ["Laura Gómez (ejemplo)", "Daniela Rojas (ejemplo)", "Paola Andrade (ejemplo)", "Juliana Vargas (ejemplo)", "Camila Silva (ejemplo)",
      "Sara Medina (ejemplo)", "Natalia Polanía (ejemplo)", "Mariana Cabrera (ejemplo)", "Valeria Trujillo (ejemplo)", "Luisa Ramírez (ejemplo)",
      "Karen Ospina (ejemplo)", "Tatiana Perdomo (ejemplo)"];
    const tels = nombres.map((_, i) => "30000000" + CR.pad(i + 10));
    const serv = ["soft-gel", "builder-gel", "semi-manos", "semi-pies", "base-rubber", "laminado", "depilacion-henna", "lifting", "trad-manos", "soft-gel", "semi-manos", "depilacion-henna"];
    const staff = C.equipo.map((e) => e.id), citas = [], hoy = CR.hoy();
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const pushCita = (fecha, hora, i, sid, estado, st) => {
      const calc = CR.calcular([sid], "");
      citas.push({ id: CR.uid() + citas.length, creada: fecha, fecha, hora, min: calc.min, staff: st, servicios: [sid], retiro: "", diseno: "", disenoNota: "",
        nombre: nombres[i], telefono: tels[i], total: calc.precio, abono: calc.abono, abonoPagado: estado !== "pendiente", estado,
        cobrado: estado === "atendida" ? calc.precio + (rnd() > 0.7 ? 5000 : 0) : 0, origen: rnd() > 0.4 ? "web" : "panel", notas: "" });
    };
    // historial: visitas pasadas
    nombres.forEach((_, i) => {
      const s = serv[i], ciclo = CR.servicio(s).ciclo;
      let back = Math.round(ciclo - 6 + rnd() * 14) + (i % 3 === 0 ? 8 : 0);
      for (let k = 0; k < 3; k++) {
        const f = CR.addDays(hoy, -back - k * ciclo);
        const dow = CR.parse(f).getDay(); if (dow === 0) continue;
        pushCita(f, ["09:00", "10:00", "14:00", "15:30", "16:00"][Math.floor(rnd() * 5)], i, s, "atendida", staff[Math.floor(rnd() * 4)]);
      }
    });
    // visitas recientes (para que el resumen del mes tenga movimiento)
    for (let k = 0; k < 16; k++) {
      const i = 4 + (k % 8), f = CR.addDays(hoy, -1 - Math.floor(rnd() * 15));
      if (CR.parse(f).getDay() === 0) continue;
      const s = ["soft-gel", "semi-pies", "builder-gel", "laminado", "base-rubber", "trad-manos", "semi-manos", "lifting"][k % 8];
      pushCita(f, ["09:00", "09:30", "14:00", "15:00", "16:00"][k % 5], i, s, "atendida", staff[k % 4]);
    }
    // próximas
    [[0, "14:00", 1, "pendiente", 0], [0, "15:00", 4, "confirmada", 1], [1, "09:00", 2, "confirmada", 2], [1, "10:30", 6, "pendiente", 0], [2, "14:30", 7, "confirmada", 3], [3, "09:30", 10, "confirmada", 1]]
      .forEach(([dd, h, i, est, st]) => { let f = CR.addDays(hoy, dd); if (CR.parse(f).getDay() === 0) f = CR.addDays(f, 1); pushCita(f, h, i, serv[i], est, staff[st]); });
    return { citas, servicios: null, equipo: null, recordatorios: {}, pin: "1234" };
  }
  const ocupadoDe = (citas) => citas.filter((c) => CR.ACTIVAS.includes(c.estado)).map((c) => ({ id: c.id, fecha: c.fecha, hora: c.hora, min: c.min, staff: c.staff }));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const local = {
    async catalogo() { const d = leer(); return { servicios: d.servicios, equipo: d.equipo }; },
    async ocupado() { return { ocupado: ocupadoDe(leer().citas) }; },
    async crearCita(c) {
      await sleep(350); const d = leer();
      if (!CR.libre(ocupadoDe(d.citas), c.fecha, c.staff, CR.toMin(c.hora), CR.toMin(c.hora) + +c.min)) throw Object.assign(new Error("Ese horario se acaba de ocupar. Elige otra hora."), { code: "ocupado" });
      const n = { ...c, id: CR.uid(), creada: CR.hoy(), estado: "pendiente", abonoPagado: false, cobrado: 0, origen: "web" };
      d.citas.push(n); guardar(d); return { cita: n };
    },
    async login(pin) { if (pin !== leer().pin) throw Object.assign(new Error("PIN incorrecto"), { code: "pin" }); return { ok: true }; },
    async todo() { const d = leer(); return { citas: d.citas, recordatorios: d.recordatorios, servicios: d.servicios, equipo: d.equipo }; },
    async guardarCita(c, pin, forzar) {
      const d = leer(); const i = d.citas.findIndex((x) => x.id === c.id);
      if (!forzar && CR.ACTIVAS.includes(c.estado) && !CR.libre(ocupadoDe(d.citas), c.fecha, c.staff, CR.toMin(c.hora), CR.toMin(c.hora) + +c.min, c.id))
        throw Object.assign(new Error("La manicurista ya tiene una cita que se cruza con ese horario."), { code: "ocupado" });
      if (i >= 0) d.citas[i] = { ...d.citas[i], ...c }; else d.citas.push({ ...c, id: CR.uid(), creada: CR.hoy() });
      guardar(d); return { ok: true };
    },
    async recordar(tel) { const d = leer(); d.recordatorios[tel] = CR.hoy(); guardar(d); return { ok: true }; },
    async guardarCatalogo(datos) { const d = leer(); if (datos.servicios) d.servicios = datos.servicios; if (datos.equipo) d.equipo = datos.equipo; guardar(d); return { ok: true }; },
    async cambiarPin(nuevo) { const d = leer(); d.pin = nuevo; guardar(d); return { ok: true }; },
    async reiniciarDemo() { try { localStorage.removeItem(KEY); } catch (e) {} return { ok: true }; }
  };

  CR.api = {
    catalogo: () => (API ? remoto("catalogo") : local.catalogo()),
    ocupado: () => (API ? remoto("ocupado") : local.ocupado()),
    crearCita: (c) => (API ? remoto("crearCita", c) : local.crearCita(c)),
    login: (pin) => (API ? remoto("login", null, pin) : local.login(pin)),
    todo: (pin) => (API ? remoto("todo", null, pin) : local.todo()),
    guardarCita: (c, pin, forzar) => (API ? remoto("guardarCita", { cita: c, forzar: !!forzar }, pin) : local.guardarCita(c, pin, forzar)),
    recordar: (tel, pin) => (API ? remoto("recordar", { telefono: tel }, pin) : local.recordar(tel)),
    guardarCatalogo: (datos, pin) => (API ? remoto("guardarCatalogo", datos, pin) : local.guardarCatalogo(datos)),
    cambiarPin: (nuevo, pin) => (API ? remoto("cambiarPin", { nuevo }, pin) : local.cambiarPin(nuevo)),
    reiniciarDemo: () => local.reiniciarDemo()
  };

  /* Aplica servicios/equipo guardados en el servidor sobre los valores por defecto */
  CR.aplicarCatalogo = function (r) {
    if (r && Array.isArray(r.servicios) && r.servicios.length) CR.cat.servicios = r.servicios.map((s) => {
      const lleno = Object.fromEntries(Object.entries(s).filter(([, v]) => v !== "" && v != null));
      return { ...(C.servicios.find((x) => x.id === s.id) || {}), ...lleno };
    });
    if (r && Array.isArray(r.equipo) && r.equipo.length) CR.cat.equipo = r.equipo;
  };
})();
