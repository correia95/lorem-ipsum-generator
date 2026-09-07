// Classic lorem ipsum word bank + a small generator.
// Randomness from crypto.getRandomValues so runs vary; deterministic structure otherwise.

const WORDS = (
  'a ac accumsan ad adipiscing aenean aliquam aliquet amet ante aptent arcu at ' +
  'auctor augue bibendum blandit class commodo condimentum congue consectetur ' +
  'consequat conubia convallis cras cubilia curabitur curae cursus dapibus diam ' +
  'dictum dictumst dignissim dis dolor donec dui duis efficitur egestas eget ' +
  'eleifend elementum elit enim erat eros est et etiam eu euismod ex facilisi ' +
  'facilisis fames faucibus felis fermentum feugiat finibus fringilla fusce ' +
  'gravida habitant habitasse hac hendrerit himenaeos iaculis id imperdiet in ' +
  'inceptos integer interdum ipsum justo lacinia lacus laoreet lectus leo libero ' +
  'ligula litora lobortis lorem luctus maecenas magna magnis malesuada massa ' +
  'mattis mauris maximus metus mi molestie mollis montes morbi nam nascetur nec ' +
  'neque netus nibh nisi nisl non nostra nulla nullam nunc odio orci ornare ' +
  'parturient pellentesque penatibus per pharetra phasellus placerat platea ' +
  'porta porttitor posuere potenti praesent pretium primis proin pulvinar purus ' +
  'quam quis quisque rhoncus ridiculus risus rutrum sagittis sapien scelerisque ' +
  'sed sem semper senectus sit sociosqu sodales sollicitudin suscipit suspendisse ' +
  'taciti tellus tempor tempus tincidunt torquent tortor tristique turpis ' +
  'ullamcorper ultrices ultricies urna ut varius vehicula vel velit venenatis ' +
  'vestibulum vitae vivamus viverra volutpat vulputate'
).split(' ');

const CLASSIC =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(
    ' ',
  );

function rnd(): number {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] / 2 ** 32;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}
function between(lo: number, hi: number): number {
  return lo + Math.floor(rnd() * (hi - lo + 1));
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function makeSentence(minW: number, maxW: number): string {
  const n = between(minW, maxW);
  const words: string[] = [];
  for (let i = 0; i < n; i++) words.push(pick(WORDS));
  // sprinkle commas
  let out = words.join(' ');
  if (n > 6) {
    const commaAt = between(2, n - 3);
    const parts = out.split(' ');
    parts[commaAt] = parts[commaAt] + ',';
    out = parts.join(' ');
  }
  return cap(out) + '.';
}

export interface Options {
  unit: 'paragraphs' | 'sentences' | 'words' | 'list';
  count: number;
  startWithLorem: boolean;
  sentencesPerPara: [number, number];
  wordsPerSentence: [number, number];
}

export const DEFAULTS: Options = {
  unit: 'paragraphs',
  count: 3,
  startWithLorem: true,
  sentencesPerPara: [3, 6],
  wordsPerSentence: [8, 16],
};

function loremOpening(wordCount: number): string {
  const w = CLASSIC.slice(0, Math.min(wordCount, CLASSIC.length));
  return w.join(' ');
}

export function generate(o: Options): string[] {
  const count = Math.max(1, Math.min(200, Math.floor(o.count) || 1));
  const [minS, maxS] = o.sentencesPerPara;
  const [minW, maxW] = o.wordsPerSentence;

  if (o.unit === 'words') {
    const words: string[] = [];
    if (o.startWithLorem) words.push(...CLASSIC.slice(0, Math.min(count, CLASSIC.length)));
    while (words.length < count) words.push(pick(WORDS));
    const text = words.slice(0, count).join(' ');
    return [cap(text) + '.'];
  }

  if (o.unit === 'sentences') {
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      if (i === 0 && o.startWithLorem) {
        out.push(cap(loremOpening(between(minW, maxW))) + '.');
      } else {
        out.push(makeSentence(minW, maxW));
      }
    }
    return [out.join(' ')];
  }

  if (o.unit === 'list') {
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      if (i === 0 && o.startWithLorem) out.push(cap(loremOpening(between(4, 9))));
      else out.push(cap(makeSentence(between(minW, maxW), maxW).replace(/\.$/, '')));
    }
    return out;
  }

  // paragraphs
  const paras: string[] = [];
  for (let p = 0; p < count; p++) {
    const sentences: string[] = [];
    const n = between(minS, maxS);
    for (let s = 0; s < n; s++) {
      if (p === 0 && s === 0 && o.startWithLorem) {
        sentences.push(cap(loremOpening(between(minW, maxW))) + '.');
      } else {
        sentences.push(makeSentence(minW, maxW));
      }
    }
    paras.push(sentences.join(' '));
  }
  return paras;
}

export function render(blocks: string[], o: Options, mode: 'text' | 'html'): string {
  if (mode === 'text') {
    if (o.unit === 'list') return blocks.map((b) => `- ${b}`).join('\n');
    return blocks.join('\n\n');
  }
  if (o.unit === 'list') {
    return '<ul>\n' + blocks.map((b) => `  <li>${b}</li>`).join('\n') + '\n</ul>';
  }
  return blocks.map((b) => `<p>${b}</p>`).join('\n');
}

export function stats(blocks: string[]): { words: number; chars: number } {
  const text = blocks.join(' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return { words, chars: text.length };
}
