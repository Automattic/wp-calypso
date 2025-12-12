/**
 * Utility functions for formatting conversation history data
 */

import { getShortDateString } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Check if two dates represent the same calendar day in the user's local timezone
 */
function isSameLocalDay( date1: Date, date2: Date ): boolean {
	const d1 = new Date( date1 );
	const d2 = new Date( date2 );
	d1.setHours( 0, 0, 0, 0 );
	d2.setHours( 0, 0, 0, 0 );

	return d1.getTime() === d2.getTime();
}

/**
 * Format a timestamp for display in conversation list
 * Shows "Today", "Yesterday", or localized date string
 * @param timestamp - Unix timestamp in seconds
 */
export function formatConversationDate( timestamp: number ): string {
	const timestampMs = timestamp * 1000;
	const date = new Date( timestampMs );
	const today = new Date();

	if ( isSameLocalDay( date, today ) ) {
		return __( 'Today', '__i18n_text_domain__' );
	}

	const yesterday = new Date( today );
	yesterday.setDate( yesterday.getDate() - 1 );

	if ( isSameLocalDay( date, yesterday ) ) {
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
