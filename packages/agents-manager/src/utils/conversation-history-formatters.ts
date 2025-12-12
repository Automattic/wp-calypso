/**
 * Utility functions for formatting conversation history data
 */

import { getShortDateString } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Format a timestamp for display in conversation list
 * Shows "Today", "Yesterday", or localized date string
 * @param timestamp - Unix timestamp in seconds
 */
export function formatConversationDate( timestamp: number ): string {
	const timestampMs = timestamp * 1000;
	const date = new Date( timestampMs );
	const today = new Date();

	if ( date.toDateString() === today.toDateString() ) {
		return __( 'Today', '__i18n_text_domain__' );
	}

	const yesterday = new Date( today );
	yesterday.setDate( yesterday.getDate() - 1 );

	if ( date.toDateString() === yesterday.toDateString() ) {
		return __( 'Yesterday', '__i18n_text_domain__' );
	}

	return getShortDateString( timestampMs, getLocaleSlug() ?? 'en' );
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
