

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

function caesarCipher(text, shift, encrypt = true) {
  if (!Number.isInteger(shift) || shift < 1 || shift > 25) return '';

  let effectiveShift = encrypt ? shift : 26 - shift;
  effectiveShift = ((effectiveShift % 26) + 26) % 26;

  const shifted = ALPHABET.slice(effectiveShift) + ALPHABET.slice(0, effectiveShift);
  const upper = ALPHABET.toUpperCase();
  const shiftedUpper = shifted.toUpperCase();

  let result = '';
  for (const ch of text) {
    const lowerIndex = ALPHABET.indexOf(ch);
    if (lowerIndex !== -1) { result += shifted[lowerIndex]; continue; }
    const upperIndex = upper.indexOf(ch);
    if (upperIndex !== -1) { result += shiftedUpper[upperIndex]; continue; }
    result += ch;
  }
  return result;
}
function textToBinary(text) {
  if (!text) return '';
  return text
    .split('')
    .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}
(function initRain() {
  const canvas = document.getElementById('rain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const fontSize = 16;
  let cols = 0;
  let drops = [];
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / fontSize);
    drops = new Array(cols).fill(0).map(() => Math.random() * -80);
  }
  window.addEventListener('resize', resize);
  resize();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    ctx.fillStyle = 'rgba(5, 7, 10, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(0, 255, 156, 0.35)';
    for (let i = 0; i < cols; i += 3) {
      const char = Math.random() > 0.5 ? '1' : '0';
      ctx.fillText(char, i * fontSize, ((i * 37) % canvas.height));
    }
    return;
  }
  function draw() {
    ctx.fillStyle = 'rgba(5, 7, 10, 0.09)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px JetBrains Mono, monospace';
    for (let i = 0; i < drops.length; i++) {
      const char = Math.random() > 0.5 ? '1' : '0';
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillStyle = Math.random() > 0.985 ? '#eafff5' : 'rgba(0, 255, 156, 0.55)';
      ctx.fillText(char, x, y);
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
function CircuitMap({ shift, encrypt, activeChars }) {
  const s = ((encrypt ? shift : 26 - shift) % 26 + 26) % 26;

  const gap = 30;
  const startX = 22;
  const width = startX * 2 + gap * 25;
  const topY = 26;
  const bottomY = 108;
  const height = 132;

  const items = [];
  for (let i = 0; i < 26; i++) {
    const x = startX + i * gap;
    const j = (i + s) % 26;
    const xj = startX + j * gap;
    items.push({ i, j, x, xj, isActive: activeChars.has(ALPHABET[i]) });
  }
  return (
    <div className="circuit-scroll">
      <svg
        className="circuit-svg"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="Diagram mapping each input letter to its shifted output letter"
      >
        <text x={startX - 12} y={topY + 4} className="row-label" textAnchor="end">IN</text>
        <text x={startX - 12} y={bottomY + 4} className="row-label" textAnchor="end">OUT</text>

        {items.map(({ i, x, xj, isActive }) => (
          <line
            key={'line-' + i}
            x1={x}
            y1={topY + 10}
            x2={xj}
            y2={bottomY - 10}
            className={isActive ? 'circuit-line active' : 'circuit-line'}
          />
        ))}

        {items.map(({ i, x, isActive }) => (
          <g key={'top-' + i} className={isActive ? 'circuit-node active' : 'circuit-node'}>
            <circle cx={x} cy={topY} r="9" />
            <text x={x} y={topY + 4}>{ALPHABET[i].toUpperCase()}</text>
          </g>
        ))}

        {items.map(({ i, j, isActive }) => {
          const xOut = startX + j * gap;
          return (
            <g key={'bot-' + i} className={isActive ? 'circuit-node active' : 'circuit-node'}>
              <circle cx={xOut} cy={bottomY} r="9" />
              <text x={xOut} y={bottomY + 4}>{ALPHABET[j].toUpperCase()}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
function App() {
  const [mode, setMode] = React.useState('encrypt');
  const [shift, setShift] = React.useState(13);
  const [input, setInput] = React.useState('Meet at the server room. Trust no one but the cipher.');
  const [showBinary, setShowBinary] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const output = React.useMemo(
    () => caesarCipher(input, shift, mode === 'encrypt'),
    [input, shift, mode]
  );

  const activeChars = React.useMemo(() => {
    const set = new Set();
    for (const ch of input.toLowerCase()) {
      if (ch >= 'a' && ch <= 'z') set.add(ch);
    }
    return set;
  }, [input]);

  const effectiveShift = ((mode === 'encrypt' ? shift : 26 - shift) % 26 + 26) % 26;

  React.useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.body.setAttribute('data-mode', mode);
  }, [mode]);

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      window.clearTimeout(handleCopy._t);
      handleCopy._t = window.setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="eyebrow">SHIFT-CIPHER TERMINAL // ROT-N</div>
        <h1 className="logo" data-text="PJ -CIPHER">PJ -CIPHER</h1>
        <p className="tagline">
          Encode and decode messages with a classic Caesar shift, rendered live in binary and light.
        </p>
      </header>

      <main className="panel">
        <div className="panel-corner tl" />
        <div className="panel-corner tr" />
        <div className="panel-corner bl" />
        <div className="panel-corner br" />

        <div className="controls-row">
          <div className="mode-toggle" role="tablist" aria-label="Cipher mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'encrypt'}
              className={mode === 'encrypt' ? 'active' : ''}
              onClick={() => setMode('encrypt')}
            >
              ENCRYPT
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'decrypt'}
              className={mode === 'decrypt' ? 'active' : ''}
              onClick={() => setMode('decrypt')}
            >
              DECRYPT
            </button>
            <span className={'mode-indicator ' + mode} />
          </div>

          <div className="shift-control">
            <label htmlFor="shift-slider">SHIFT</label>
            <input
              id="shift-slider"
              type="range"
              min="1"
              max="25"
              value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
            />
            <span className="shift-value">{String(shift).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="stream-block">
          <div className="stream-label">
            <span>&gt; INPUT_STREAM</span>
          </div>
          <textarea
            className="stream-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck="false"
            rows="4"
            aria-label="Text to encrypt or decrypt"
          />
        </div>

        <div className="stream-block">
          <div className="stream-label">
            <span>&gt; OUTPUT_STREAM</span>
            <button type="button" className="copy-btn" onClick={handleCopy}>
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
          <textarea
            className="stream-output"
            value={output}
            readOnly
            spellCheck="false"
            rows="4"
            aria-label="Cipher result"
          />

          <label className="binary-toggle">
            <input
              type="checkbox"
              checked={showBinary}
              onChange={(e) => setShowBinary(e.target.checked)}
            />
            <span>show binary stream</span>
          </label>

          {showBinary && (
            <div className="binary-stream">
              {textToBinary(output) || '00000000'}
            </div>
          )}
        </div>
      </main>

      <section className="circuit-section">
        <h2>
          ALPHABET CIRCUIT
          <span className="circuit-shift">shift +{effectiveShift}</span>
        </h2>
        <CircuitMap shift={shift} encrypt={mode === 'encrypt'} activeChars={activeChars} />
      </section>

      <footer className="footer">
        <span>built for PJ · caesar shift engine</span>
      </footer>
    </div>
  );
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
