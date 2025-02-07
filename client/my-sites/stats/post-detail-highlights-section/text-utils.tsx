import { decodeEntities, stripHTML } from 'calypso/lib/formatting';

export function truncateWithLimit( text: string, limit: number ): string {
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

export function getProcessedTitle( text: string ): string {
	if ( ! text ) {
		return '';
	}

	return decodeEntities( stripHTML( text ) );
}
