/**
 * Utility functions for formatting conversation history data
 */

import { __ } from '@wordpress/i18n';

/**
 * Format a timestamp for display in conversation list
 * Shows "Today", "Yesterday", or date string
 * @param timestamp - Unix timestamp in seconds
 */
export function formatConversationDate( timestamp: number ): string {
	const date = new Date( timestamp * 1000 );
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
