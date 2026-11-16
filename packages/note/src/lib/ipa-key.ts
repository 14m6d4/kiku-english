/**
 * The key two notes share when they have the same reading: the first IPA
 * transcription in ExpressionReading. Yomitan writes the field as an HTML list
 * with one item per accent, so comparing whole fields would be brittle.
 */
export function ipaKey(reading: string | undefined) {
  const text = (reading ?? "").replace(/<[^>]*>/g, " ");
  return (text.match(/[/[][^/[\]]+[/\]]/)?.[0] ?? text).replace(/\s+/g, " ").trim();
}

/**
 * A regex for Anki's `field:re:` search that matches a field containing the key.
 * Every character Anki's search syntax or the regex engine could treat
 * specially becomes `.`, so nothing needs escaping; callers compare the keys
 * exactly afterwards.
 */
export function ipaKeySearchPattern(key: string) {
  return key.replace(/[^\p{L}\p{M}]/gu, ".");
}
