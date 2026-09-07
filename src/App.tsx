import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULTS, Options, generate, render, stats } from './lorem';

type Unit = Options['unit'];
const UNITS: { id: Unit; label: string }[] = [
  { id: 'paragraphs', label: 'Paragraphs' },
  { id: 'sentences', label: 'Sentences' },
  { id: 'words', label: 'Words' },
  { id: 'list', label: 'List items' },
];

function readOpts(): Options {
  const p = new URLSearchParams(window.location.search);
  const unit = (['paragraphs', 'sentences', 'words', 'list'] as Unit[]).includes(p.get('u') as Unit)
    ? (p.get('u') as Unit)
    : DEFAULTS.unit;
  return {
    ...DEFAULTS,
    unit,
    count: Math.max(1, Math.min(200, Number(p.get('n')) || DEFAULTS.count)),
    startWithLorem: p.get('l') !== '0',
  };
}

export default function App() {
  const [opts, setOpts] = useState<Options>(readOpts);
  const [mode, setMode] = useState<'text' | 'html'>('text');
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const blocks = useMemo(() => generate(opts), [opts, seed]);
  const output = useMemo(() => render(blocks, opts, mode), [blocks, opts, mode]);
  const s = useMemo(() => stats(blocks), [blocks]);

  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set('u', opts.unit);
    u.searchParams.set('n', String(opts.count));
    if (opts.startWithLorem) u.searchParams.delete('l');
    else u.searchParams.set('l', '0');
    window.history.replaceState(null, '', u.toString());
  }, [opts]);

  const set = (patch: Partial<Options>) => setOpts((o) => ({ ...o, ...patch }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      taRef.current?.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const unitNoun =
    opts.unit === 'paragraphs' ? 'paragraph' : opts.unit === 'sentences' ? 'sentence' : opts.unit === 'words' ? 'word' : 'item';

  return (
    <div className="wrap">
      <header>
        <h1>Lorem Ipsum Generator</h1>
        <p className="sub">
          Placeholder text for mockups and layouts — paragraphs, sentences, words or list items, as
          plain text or ready-to-paste HTML. Generated in your browser.
        </p>
      </header>

      <div className="controls">
        <div className="seg units">
          {UNITS.map((u) => (
            <button key={u.id} className={opts.unit === u.id ? 'on' : ''} onClick={() => set({ unit: u.id })}>
              {u.label}
            </button>
          ))}
        </div>

        <div className="row">
          <label className="count">
            How many {unitNoun}s
            <input
              type="number"
              min={1}
              max={200}
              value={opts.count}
              onChange={(e) => set({ count: Math.max(1, Math.min(200, Number(e.target.value) || 1)) })}
            />
          </label>
          <label className="chk">
            <input
              type="checkbox"
              checked={opts.startWithLorem}
              onChange={(e) => set({ startWithLorem: e.target.checked })}
            />
            Start with “Lorem ipsum dolor sit amet…”
          </label>
        </div>

        <div className="row">
          <button className="regen" onClick={() => setSeed((n) => n + 1)}>↻ Regenerate</button>
          <div className="seg fmt">
            <button className={mode === 'text' ? 'on' : ''} onClick={() => setMode('text')}>Plain text</button>
            <button className={mode === 'html' ? 'on' : ''} onClick={() => setMode('html')}>HTML</button>
          </div>
        </div>
      </div>

      <div className="outbar">
        <span>{s.words.toLocaleString()} words · {s.chars.toLocaleString()} characters</span>
        <button className="copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>

      <textarea ref={taRef} className="output" readOnly value={output} spellCheck={false} />

      <section className="explain">
        <h2>What is lorem ipsum?</h2>
        <p>
          Lorem ipsum is scrambled Latin used as a stand-in for real copy while a design is being
          worked on. It has been the printing industry's dummy text since the 1500s and reads as
          plausible words without meaning, so it fills a layout without anyone stopping to read it.
        </p>
        <h3>Why not just type “content content content”?</h3>
        <p>
          Repeated words give an unrealistic block shape and an even texture. Lorem ipsum has
          word-length variety close to English, so paragraphs, line breaks and hyphenation behave
          the way they will with real text.
        </p>
        <h3>How do I use the HTML output?</h3>
        <p>
          Switch the format to <strong>HTML</strong> and each paragraph is wrapped in
          <code>&lt;p&gt;</code>, or each list item in <code>&lt;li&gt;</code> inside a
          <code>&lt;ul&gt;</code>. Copy it straight into a template or a CMS field.
        </p>
        <h3>Is it the same text every time?</h3>
        <p>
          No. Each generate uses fresh random words (from your browser's crypto random source), so
          you get new placeholder text on every click. The unit, count and opening-line setting are
          kept in the page URL so you can bookmark a preset.
        </p>
        <footer>Lorem Ipsum Generator · client-side · no sign-up · works offline</footer>
      </section>
    </div>
  );
}
