/* NIIF Inteligente — landing app */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ----------- Hooks ----------- */
function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const h = window.innerHeight || 1;
        setP(Math.max(0, Math.min(2, y / h)));
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ----------- Sound Wave ----------- */
function SoundWave({ count = 41, height = 60, opacity = 1, className = "" }) {
  // Sinusoidal heights with light random variation, deterministic
  const bars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      // two overlapping sine envelopes for organic shape
      const env =
      0.55 * Math.sin(Math.PI * t) +
      0.35 * Math.sin(Math.PI * 3 * t + 0.6) +
      0.20 * Math.sin(Math.PI * 5 * t + 1.2);
      const norm = (env + 1) / 2; // 0..1
      // pseudo-random jitter using deterministic hash
      const jit = Math.sin(i * 12.9898) * 43758.5453 % 1;
      const j = Math.abs(jit);
      const h = Math.round(14 + norm * 36 + j * 8); // 14..58
      const delay = +((i * 0.063 + j * 0.4) % 2.6).toFixed(2);
      arr.push({ h, delay });
    }
    return arr;
  }, [count]);

  return (
    <div className={`wave ${className}`} style={{ height, opacity }} aria-hidden="true">
      {bars.map((b, i) =>
      <span
        key={i}
        className="bar"
        style={{
          "--bar-h": `${b.h}px`,
          animationDelay: `${b.delay}s`
        }} />

      )}
    </div>);

}

/* ----------- Brand bits ----------- */
function Logo() {
  return (
    <div className="logo">
      <span className="reto">Reto</span>
      <span className="niif">NIIF</span>
    </div>);

}

const PAY_URL = "https://pay.hotmart.com/P105616419A?off=4px7z6cr&checkoutMode=10";

function openPay() {
  if (typeof fbq === "function") {
    fbq("track", "InitiateCheckout");
  }
  window.open(PAY_URL, "_blank", "noopener,noreferrer");
}

/* ----------- Sections ----------- */
function Navbar({ onCta }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Logo />
        <div className="nav-links">
          <a href="#programa">Programa</a>
          <a href="#incluye">Incluye</a>
          <a href="#testimonios">Testimonios</a>
          <a href="#precio">Precio</a>
        </div>
        <button className="cta" onClick={onCta} style={{ padding: "10px 20px", fontSize: 13 }}>
          Inscribirme <span className="arrow">→</span>
        </button>
      </div>
    </nav>);

}

function Hero({ progress, onCta }) {
  const wrapRef = useRef(null);
  const contentRef = useRef(null);

  // Apply scroll-driven transforms
  useEffect(() => {
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;
    const p = Math.min(1, progress);
    const scale = 1 + p * 0.2;
    wrap.style.transform = `scale(${scale})`;
    const fade = Math.max(0, 1 - p / 0.4);
    content.style.opacity = fade.toFixed(3);
    content.style.transform = `translateY(${(1 - fade) * -28}px)`;
  }, [progress]);

  return (
    <header className="hero" id="top">
      <div className="hero-video-wrap" ref={wrapRef}>
        <img className="hero-still" src="assets/niif-bg.jpg" alt="" />
      </div>

      <div className="hero-content" ref={contentRef}>
        <span className="badge">
          <span className="dot" /> Inicia 23 de Mayo · Cupos Limitados
        </span>
        <h1 className="display">
          <span className="yellow">La IA que interpreta</span>
          <span className="white">las NIIF por ti.</span>
        </h1>
        <p className="sub" style={{ color: "rgb(255, 255, 255)" }}>Un programa intensivo para contadores y firmas que convierte la norma en decisiones guiado por un copiloto entrenado en estándares internacionales y casos reales.


        </p>
        <button className="cta" onClick={onCta}>
          Reservar mi cupo <span className="arrow">→</span>
        </button>

        <div className="hero-stats">
          <div className="cell">
            <div className="v">16<span style={{ fontSize: 14, marginLeft: 4 }}>HRS</span></div>
            <div className="l">En vivo</div>
          </div>
          <div className="cell">
            <div className="v">100<span style={{ fontSize: 14 }}>%</span></div>
            <div className="l">Práctico</div>
          </div>
          <div className="cell">
            <div className="v">IA</div>
            <div className="l">Integrada</div>
          </div>
          <div className="cell">
            <div className="v">23/05</div>
            <div className="l">Inicio</div>
          </div>
        </div>

        <div className="hero-wave-inline">
          <SoundWave count={41} height={50} />
        </div>
      </div>
    </header>);

}

function Problema() {
  return (
    <section className="problema" id="problema">
      <div className="problema-bg-wave">
        <SoundWave count={61} height={140} opacity={0.08} />
      </div>
      <div className="problema-inner">
        <span className="section-tag dark reveal">El punto ciego</span>
        <h2 className="display reveal">
          Estudiaste las NIIF.<br />
          Aún así, te traicionan.
        </h2>
        <p className="lead reveal">La norma cambia, los criterios se mezclan y los detalles se escapan. La diferencia entre un cierre limpio y un dictamen difícil casi nunca está en lo que sabes; está en lo que recuerdas en el momento exacto.



        </p>
        <div className="pain-list">
          {[
          "Cometes errores en normas que ya estudiaste",
          "Te sientes inseguro frente a clientes",
          "Sientes que te falta algo sin saber qué"].
          map((t, i) =>
          <div key={i} className="pain reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="num">0{i + 1}</span>
              <span>{t}</span>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function Solucion() {
  const cards = [
  {
    n: "01",
    t: "Copiloto NIIF",
    d: "Un asistente entrenado en NIIF plenas y NIIF para PYMES. Pregúntale por una sección, un caso o un asiento — responde con cita y contexto."
  },
  {
    n: "02",
    t: "Casos reales",
    d: "Estudiaremos casos reales para asegurar que tu proceso de aprendizaje este completo."
  },
  {
    n: "03",
    t: "Plantillas listas",
    d: "Plantillas de NIIF listas para usar, para aplicar de forma inmediata."
  }];

  return (
    <section className="solucion" id="programa">
      <div className="container">
        <div className="head reveal">
          <span className="section-tag light">El programa</span>
          <h2 className="display">Tres herramientas, una decisión clara.</h2>
          <p className="lead">NIIF Inteligente combina formación intensiva con un copiloto persistente. Cuando el curso termina, el asistente sigue contigo, todos los días, en cada cliente.


          </p>
        </div>
        <div className="cards-3">
          {cards.map((c, i) =>
          <div
            key={c.n}
            className="card-feature reveal"
            style={{ transitionDelay: `${i * 100}ms` }}>
            
              <div className="num">{c.n}</div>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function Incluye() {
  const items = [
  { t: "16 horas en vivo", d: "Cuatro sesiones de cuatro horas con resolución de casos en tiempo real." },
  { t: "Acceso al copiloto", d: "12 meses de uso ilimitado del asistente NIIF entrenado para tu práctica." },
  { t: "Biblioteca de plantillas", d: "Ten acceso a plantillas que facilitarán tu proceso de ejecución de NIIF." },
  { t: "Casos resueltos", d: "Casos reales para que comprendas mejor el uso de la norma." },
  { t: "Plataforma educativa", d: "¿No pudiste ingresar? Tienes acceso a la grabación durante 12 meses." },
  { t: "Certificado", d: "Acreditación con código verificable al completar las cuatro sesiones." }];

  return (
    <section className="incluye" id="incluye">
      <div className="container">
        <div className="head reveal">
          <span className="section-tag light">Lo que recibes</span>
          <h2 className="display">Todo en un solo paquete.</h2>
          <p className="lead">
            Diseñado para que no necesites comprar nada más durante el próximo año fiscal.
          </p>
        </div>
        <div className="incluye-grid">
          {items.map((it, i) =>
          <div key={i} className="incluye-item reveal" style={{ transitionDelay: `${i % 3 * 80}ms` }}>
              <span className="incluye-check">#</span>
              <div>
                <h4>{it.t}</h4>
                <p>{it.d}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function Trust() {
  const stats = [
  { v: "1,200+", l: "Contadores formados" },
  { v: "98%", l: "Recomendarían" },
  { v: "16h", l: "De contenido" },
  { v: "4.9", l: "Promedio sobre 5" }];

  return (
    <section className="trust">
      <div className="container">
        <div className="trust-grid">
          {stats.map((s, i) =>
          <div key={i} className="trust-cell reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="v display">{s.v}</div>
              <div className="l">{s.l}</div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function Testimonios() {
  const t = [
  {
    q: "Pasé de revisar la norma cada cierre a confiar en mi criterio. El copiloto me responde en segundos lo que antes me tomaba media tarde.",
    n: "Marcela H.",
    r: "Contadora pública · Bogotá",
    a: "MH"
  },
  {
    q: "Los casos prácticos son lo mejor del programa. No es teoría — son los problemas reales que llegan a mi escritorio cada lunes.",
    n: "Andrés C.",
    r: "Socio, firma boutique · Medellín",
    a: "AC"
  },
  {
    q: "Mi equipo dejó de pelearse con los papeles de trabajo. La consistencia entre cierres aumentó muchísimo desde la primera semana.",
    n: "Patricia V.",
    r: "Directora financiera · Cali",
    a: "PV"
  }];

  return (
    <section className="testimonios" id="testimonios">
      <div className="container">
        <div className="head reveal">
          <span className="section-tag light">Quienes ya pasaron</span>
          <h2 className="display">No te lo decimos nosotros.</h2>
          <p className="lead">Tres voces de contadores que ya se capacitaron con nosotros.</p>
        </div>
        <div className="t-grid">
          {t.map((it, i) =>
          <div key={i} className="t-card reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <p className="quote">“{it.q}”</p>
              <div className="who">
                <div className="avatar">{it.a}</div>
                <div>
                  <div className="name">{it.n}</div>
                  <div className="role">{it.r}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function Pricing({ onCta }) {
  return (
    <section className="pricing" id="precio">
      <div className="pricing-bg" />
      <div className="container pricing-inner">
        <span className="section-tag dark reveal">Inversión</span>
        <h2 className="display reveal">Un cierre limpio<br />paga el programa.</h2>
        <p className="lead reveal">
          Pago único. Sin renovaciones automáticas. Sin letra pequeña.
        </p>
        <div className="price-card reveal">
          <span className="start-badge">Inicia 23 de Mayo</span>
          <h3>NIIF INTELIGENTE</h3>
          <div className="row">
            <span className="price">$297.000</span>
            <span className="strike">$497.000</span>
          </div>
          <div className="currency-label">PAGO ÚNICO</div>
          <ul style={{ marginTop: 22 }}>
            <li>16 horas de formación en vivo</li>
            <li>12 meses de copiloto NIIF</li>
            <li>Plantillas y papeles de trabajo</li>
            <li>Plataforma y certificado</li>
          </ul>
          <button className="cta-full" onClick={onCta}>
            Reservar mi cupo →
          </button>
          <div className="meta">Cupos limitados · Pago único · Garantía de 7 días</div>
        </div>
      </div>
    </section>);

}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Logo />
        <div className="footer-meta">
          <a href="#top">Inicio</a>
          <a href="#programa">Programa</a>
          <a href="#precio">Precio</a>
          <a href="#">Términos</a>
          <a href="#">Contacto</a>
        </div>
        <div className="copyright">© 2026 Reto Tributario · Todos los derechos reservados</div>
      </div>
    </footer>);

}

/* ----------- App ----------- */
function App() {
  const progress = useScrollProgress();
  const [showSticky, setShowSticky] = useState(false);
  useReveal();

  useEffect(() => {
    setShowSticky(progress > 0.3 && progress < 6);
  }, [progress]);

  const scrollToPrice = useCallback(() => {
    const el = document.getElementById("precio");
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });
  }, []);

  return (
    <>
      <Navbar onCta={openPay} />
      <Hero progress={progress} onCta={openPay} />
      <Problema />
      <Solucion />
      <Incluye />
      <Trust />
      <Testimonios />
      <Pricing onCta={openPay} />
      <Footer />
      <button
        className={`sticky-cta ${showSticky ? "show" : ""}`}
        onClick={openPay}>
        
        Reservar cupo · 23 de Mayo →
      </button>
    </>);

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);