import { decodeEntities, stripHTML } from 'calypso/lib/formatting';

/**
 * Truncate the input text to the nearest whitespace within the specified limit,
 * appending an ellipsis if necessary.
 * @param {string} text - The input text to be truncated.
 * @param {number} limit - The maximum length of the truncated text.
 * @returns {string} - The truncated text with an ellipsis if it exceeds the limit.
 */

const DEFAULT_TRUNCATE_LIMIT = 48;

export function truncateWithLimit( text: string, limit: number = DEFAULT_TRUNCATE_LIMIT ): string {
	if ( ! text ) {
		return '';
	}

	// Determine if any processing is needed.
	const trimmedText = text.trim();
	if ( trimmedText.length <= limit ) {
		return trimmedText;
	}

	// Find the last whitespace character within the limit.
	const truncatedText = trimmedText.substring( 0, limit );
	const lastWhitespaceIndex = truncatedText.lastIndexOf( ' ' );

	// If there's no whitespace within the limit, truncate at the limit.
	if ( lastWhitespaceIndex === -1 ) {
		return truncatedText + '...';
	}

	// Truncate at the last whitespace character.
	return trimmedText.substring( 0, lastWhitespaceIndex ) + '...';
}

/**
 * Process the input text by decoding HTML entities and stripping HTML tags.
 * @param {string} text - The input text to be processed.
 * @returns {string} - The processed text with HTML entities decoded and HTML tags stripped.
 */

export function getProcessedText( text: string ): string {
	if ( ! text ) {
		return '';
	}

	return decodeEntities( stripHTML( text ) );
}
