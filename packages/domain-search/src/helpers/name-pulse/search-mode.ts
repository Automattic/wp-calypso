import { NAME_PULSE_AI_MODE_MIN_WORDS } from './constants';
import { sanitizeKeywordInput } from './sanitize';

export type NamePulseSearchMode = 'exact' | 'ai';

/**
 * Count words after keyword sanitisation, so punctuation-only tokens don't count.
 */
export function getWordCount( query: string ): number {
	const sanitized = sanitizeKeywordInput( query );

	return sanitized ? sanitized.split( ' ' ).length : 0;
}

/**
 * 1–3 words: exact-match grid (plus related matches from 2 words).
 * 4+ words: AI mode — creative suggestions, exact grid hidden.
 */
export function getSearchMode( wordCount: number ): NamePulseSearchMode {
	return wordCount >= NAME_PULSE_AI_MODE_MIN_WORDS ? 'ai' : 'exact';
}
