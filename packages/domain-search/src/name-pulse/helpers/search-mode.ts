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

export function getSearchMode( wordCount: number ): NamePulseSearchMode {
	return wordCount >= NAME_PULSE_AI_MODE_MIN_WORDS ? 'ai' : 'exact';
}
