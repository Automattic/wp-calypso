/**
 * Utility functions for formatting conversation history data
 */

import { getShortDateString } from '@automattic/i18n-utils';
import { __, sprintf } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';
import type { ConversationType } from '../types';

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
function formatConversationDate( timestamp: number ): string {
	if ( ! timestamp || timestamp < 0 ) {
		return '';
	}

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
 * Generate a conversation subtitle based on the conversation type and timestamp
 * @param type - The conversation type
 * @param timestamp - Unix timestamp in seconds
 */
export function generateConversationSubtitle( type: ConversationType, timestamp: number ): string {
	const date = formatConversationDate( timestamp );

	if ( type === 'zendesk' ) {
		return sprintf(
			/* translators: %s: date of the conversation */
			__( 'Happiness chat · %s', '__i18n_text_domain__' ),
			date
		);
	}

	// TODO: Remove the `type` debug info before release.
	// NOTE: Add a tempo `type` for us to debug which type of conversation it is.
	return `${ date } · ${ type }`;
}
