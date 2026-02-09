/**
 * Utility functions for formatting conversation history data
 */

import { getShortDateString } from '@automattic/i18n-utils';
import { __, sprintf } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Parse a date string as UTC and return its timestamp
 * Handles both ISO 8601 ("2025-12-17T13:08:44.000Z") and space-separated ("2025-12-17 13:08:44") formats.
 * @param dateStr - Date string to parse
 * @returns UTC timestamp in milliseconds, or `0` if `undefined`
 */
export function parseUTCTimestamp( dateStr: string | undefined ): number {
	if ( ! dateStr ) {
		return 0;
	}
	const normalized = dateStr.includes( 'T' ) ? dateStr : dateStr.replace( ' ', 'T' ) + 'Z';
	return new Date( normalized ).getTime();
}

/**
 * Check if two dates represent the same calendar day in the user's local timezone
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns true if both dates are on the same calendar day
 */
function isSameLocalDay( date1: Date, date2: Date ): boolean {
	return date1.toDateString() === date2.toDateString();
}

/**
 * Format a datetime string for display in conversation list
 * Shows "Today", "Yesterday", or localized date string
 * @param dateTime - MySQL datetime string (e.g., "2025-12-17 13:08:44")
 * @returns Formatted date string ("Today", "Yesterday", or localized date)
 */
function formatConversationDate( dateTime: string ): string {
	const date = new Date( dateTime );

	// Return empty string for invalid dates
	if ( isNaN( date.getTime() ) ) {
		return '';
	}

	const today = new Date();

	if ( isSameLocalDay( date, today ) ) {
		return __( 'Today', '__i18n_text_domain__' );
	}

	const yesterday = new Date( today );
	yesterday.setDate( yesterday.getDate() - 1 );

	if ( isSameLocalDay( date, yesterday ) ) {
		return __( 'Yesterday', '__i18n_text_domain__' );
	}

	return getShortDateString( date.getTime(), getLocaleSlug() ?? 'en' );
}

/**
 * Generate a conversation title from the first user message
 * Returns the trimmed message content (CSS handles ellipsis via text-overflow)
 * @param messageContent - The message content to use as title
 * @returns The trimmed message content, or "Untitled conversation" if empty/whitespace
 */
export function generateConversationTitle( messageContent: string ): string {
	const title = messageContent?.trim();

	if ( ! title ) {
		return __( 'Untitled conversation', '__i18n_text_domain__' );
	}

	return title;
}

/**
 * Generate a conversation subtitle based on the conversation type and datetime
 * @param dateTime - MySQL datetime string (e.g., "2025-12-17 13:08:44")
 * @param isHe - Whether this is a Happiness Engineer chat
 * @returns Formatted subtitle string
 */
export function generateConversationSubtitle( dateTime: string, isHe?: boolean ): string {
	const date = formatConversationDate( dateTime );

	if ( isHe ) {
		return sprintf(
			/* translators: %s: date of the conversation */
			__( 'Happiness chat · %s', '__i18n_text_domain__' ),
			date
		);
	}

	return date;
}
