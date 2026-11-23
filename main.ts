// One Word From Grandma — the entry is a single word, and the word is the whole joke.
//
// The voice: a 79-year-old who texts one-thumbed, in lower case, at 6:41 a.m., and who
// has never once re-read a message before sending it. She has just been shown the thing
// in her grandson's kitchen that answers her back. She is not terrified of it. She is
// unconvinced by it, and faintly fond of the boy who owns it.
//
// The word is misspelled on purpose: she means "the computer", and will not be spelling
// it correctly, because she is not persuaded it is a real noun. The missing 'e' is the
// submission.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** The entry. One token, lower case, no punctuation, deliberately misspelled. */
const WORD = "computor";

/** What she means by it, for the printed report. */
const MEANING = "she means 'the computer', and declined to spell it that way";

/**
 * The gate is lenient (1..30 chars, not only whitespace). This guard is stricter on
 * purpose: an entry that would read as anything other than one clean token is not the
 * word she texted, so refuse to write it at all.
 */
function validateWord(word: string): void {
  if (word.length < 1 || word.length > 30) {
    throw new Error(`entry must be 1..30 characters, got ${word.length}`);
  }
  if (word.trim() !== word) {
    throw new Error("entry has leading or trailing whitespace");
  }
  if (/\s/.test(word)) {
    throw new Error("entry contains whitespace; a texted word is one token");
  }
  // Punctuation she would not type: hyphens and apostrophes break the "one token" read.
  if (/[-'’`"]/.test(word)) {
    throw new Error("entry contains a hyphen or quote; that is not one token");
  }
  // Control characters, zero-width joiners, stray non-breaking spaces.
  if (/[\u0000-\u001f\u007f\u00a0\u200b-\u200f\u2028\u2029\ufeff]/.test(word)) {
    throw new Error("entry contains control or invisible characters");
  }
  if (!/^[\p{L}\p{N}]+$/u.test(word)) {
    throw new Error("entry must be letters and digits only: it is a word she typed");
  }
}

/** How the token breaks down, so the report proves the pick rather than asserting it. */
function describe(word: string): string {
  const letters = [...word].filter((c) => /\p{L}/u.test(c)).length;
  const digits = [...word].filter((c) => /\p{N}/u.test(c)).length;
  const vowels = [...word].filter((c) => /[aeiou]/i.test(c)).length;
  return `${letters} letters, ${digits} digits, ${vowels} vowels, 0 spaces`;
}

function writeEntry(word: string): string {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR?.trim() || "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, word, { encoding: "utf8" });
  return target;
}

function main(): void {
  validateWord(WORD);
  const target = writeEntry(WORD);

  console.log(`word:     ${WORD}`);
  console.log(`length:   ${WORD.length} characters, 1 token, ${Buffer.byteLength(WORD, "utf8")} bytes`);
  console.log(`shape:    ${describe(WORD)}`);
  console.log(`meaning:  ${MEANING}`);
  console.log("voice:    lower case, one thumb, 6:41 a.m., sent without re-reading");
  console.log("why:      'computer' is the obvious entry and it loses; this is not a misspelling");
  console.log("          of the machine, it is her opinion of the machine.");
  console.log(`written:  ${target} (utf8, no trailing newline)`);
}

main();
