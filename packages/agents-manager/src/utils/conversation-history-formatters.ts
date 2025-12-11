/**
 * Utility functions for formatting conversation history data
 */

import { __ } from '@wordpress/i18n';

/**
 * Format a timestamp for display in conversation list
 * Shows "Today", "Yesterday", or date string
 * @param timestamp - MySQL datetime format (e.g., "2025-11-06 14:29:49") or Unix timestamp in milliseconds
 */
export function formatConversationDate( timestamp: string | number ): string {
	const date =
		typeof timestamp === 'number'
			? new Date( timestamp )
			: new Date( timestamp.replace( ' ', 'T' ) + 'Z' );

	const today = new Date();
	const yesterday = new Date( today );
	yesterday.setDate( yesterday.getDate() - 1 );

	if ( date.toDateString() === today.toDateString() ) {
		return __( 'Today', '__i18n_text_domain__' );
	}

	if ( date.toDateString() === yesterday.toDateString() ) {
		return __( 'Yesterday', '__i18n_text_domain__' );
	}

	return date.toLocaleDateString( 'en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	} );
}

/**
 * Generate a conversation title from the first user message
 * Returns the trimmed message content (CSS handles ellipsis via text-overflow)
 * @param messageContent
 */
export function generateConversationTitle( messageContent: string ): string {
	if ( ! messageContent ) {
		return __( 'Untitled conversation', '__i18n_text_domain__' );
	}

	return messageContent.trim();
}
