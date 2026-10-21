/**
 * Soft word threshold the Fediverse composer uses to trigger the
 * "publish on your own site instead" overflow handoff. AP posts are
 * blog-post-shaped, so a word count maps onto "this is getting too long
 * for a status update" better than a grapheme cap. Backend enforces its
 * own char limit and rejects with `text_too_long` if exceeded — the UI
 * value is purely a soft-handoff cue.
 */
const DEFAULT_FEDIVERSE_WORD_THRESHOLD = 100;

/**
 * Returns the per-render word threshold for the Fediverse composer.
 * Mirrors `useMastodonComposerLimit`'s shape (called every render via
 * `ComposerConfig.useLimit`) but counts words instead of graphemes.
 *
 * `connectionId` is `null` when no mode is active (modal closed); the
 * value is unused while closed, so the constant fallback is fine. Per-
 * blog overrides could land via a future `word_threshold` field on the
 * connections endpoint; this hook would consume it the same way.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useFediverseComposerLimit( connectionId: number | null ): number {
	return DEFAULT_FEDIVERSE_WORD_THRESHOLD;
}
