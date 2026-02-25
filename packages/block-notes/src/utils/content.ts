/**
 * Block notes content utilities
 */

/**
 * Regular expression pattern for matching @ai mentions.
 */
export const AI_MENTION_PATTERN = /@ai\b/;

/**
 * Checks if text contains an @ai mention.
 * @param text - The text to check
 * @returns True if text contains @ai mention
 */
export function hasAiMention( text: string | null | undefined ): boolean {
	if ( ! text ) {
		return false;
	}
	return AI_MENTION_PATTERN.test( text );
}

/**
 * Splits text by @ai mentions, preserving the mentions in the result array.
 * Useful for processing text and wrapping mentions with styling.
 * @param text - The text to split
 * @returns Array of text parts, with @ai mentions as separate elements
 * @example
 * ```ts
 * splitByAiMention('Hello @ai help');
 * // Returns: ['Hello ', '@ai', ' help']
 * ```
 */
export function splitByAiMention( text: string ): string[] {
	return text.split( /(@ai\b)/g );
}
