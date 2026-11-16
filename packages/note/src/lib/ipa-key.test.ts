import { describe, expect, it } from "vitest";
import { ipaKey, ipaKeySearchPattern } from "./ipa-key";

const yomitan =
  '<ul><li class="pronunciation" data-pronunciation-type="phonetic-transcription"><i>(<span class="tag" data-details="🇺🇸">🇺🇸</span>)</i> /ˌkɑːnvərˈseɪʃn/</li><li class="pronunciation" data-pronunciation-type="phonetic-transcription"><i>(<span class="tag" data-details="🇬🇧">🇬🇧</span>)</i> /ˌkɒnvəˈseɪʃn/</li></ul>';

describe("ipaKey", () => {
  it("takes the first transcription from Yomitan's list", () => {
    expect(ipaKey(yomitan)).toBe("/ˌkɑːnvərˈseɪʃn/");
  });

  it("keeps plain readings and brackets", () => {
    expect(ipaKey("/ˈredʒɪstri/")).toBe("/ˈredʒɪstri/");
    expect(ipaKey("[ˈθɜː(r)]")).toBe("[ˈθɜː(r)]");
    expect(ipaKey(" no slashes ")).toBe("no slashes");
    expect(ipaKey(undefined)).toBe("");
  });
});

describe("ipaKeySearchPattern", () => {
  it("leaves only letters, so Anki's search reads it literally", () => {
    expect(ipaKeySearchPattern("/ˈθɜː(r) ɡəʊ/")).toBe(".ˈθɜː.r..ɡəʊ.");
    expect(
      new RegExp(ipaKeySearchPattern("/ˈθɜː(r)/")).test(
        yomitan.replace("ˌkɑːnvərˈseɪʃn", "ˈθɜː(r)"),
      ),
    ).toBe(true);
  });
});
