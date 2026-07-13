import { PROFILE_CHUNKS, ProfileChunk } from "@/data/profile";

// Lightweight lexical retrieval (TF-IDF style) over the profile chunks.
// The corpus is tiny, so this runs in-process with no vector store —
// the LLM only ever sees the top-k chunks relevant to the question.

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "do", "does",
  "did", "what", "which", "who", "whom", "how", "when", "where", "why", "of",
  "in", "on", "at", "to", "for", "with", "and", "or", "about", "her", "hers",
  "his", "she", "he", "their", "them", "they", "tell", "me", "your", "you",
  "i", "it", "its", "have", "has", "had", "can", "could", "would", "should",
  "this", "that", "these", "those", "there", "any", "some", "please",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

const docs = PROFILE_CHUNKS.map((chunk) => ({
  chunk,
  terms: tokenize(chunk.title + " " + chunk.text),
}));

const docFreq = new Map<string, number>();
for (const d of docs) {
  new Set(d.terms).forEach((t) => {
    docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
  });
}
const N = docs.length;

export function retrieve(query: string, k = 4): ProfileChunk[] {
  const qTerms = tokenize(query);
  if (qTerms.length === 0) return PROFILE_CHUNKS.slice(0, k);

  const scored = docs.map((d) => {
    let score = 0;
    for (const term of qTerms) {
      // exact match, or prefix match for longer words ("project" ~ "projects")
      const tf = d.terms.filter(
        (t) => t === term || (term.length >= 4 && t.startsWith(term))
      ).length;
      if (tf > 0) {
        const idf = Math.log(1 + N / (docFreq.get(term) ?? 1));
        score += (1 + Math.log(tf)) * idf;
      }
    }
    return { chunk: d.chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored
    .filter((s) => s.score > 0)
    .slice(0, k)
    .map((s) => s.chunk);
  // nothing matched (e.g. greeting) — fall back to the identity chunks
  return top.length > 0 ? top : PROFILE_CHUNKS.slice(0, k);
}
