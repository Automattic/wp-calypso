/**
 * Utility functions for formatting conversation history data
 */

import { __ } from '@wordpress/i18n';

/**
 * Parse MySQL datetime format to Date object
 * Input format: "2025-11-06 14:29:49"
 * @param mysqlDateTime - MySQL datetime string
 * @returns Date object
 */
export function parseMySQLDateTime( mysqlDateTime: string ): Date {
	// MySQL datetime format: "YYYY-MM-DD HH:MM:SS"
	// Replace space with 'T' to make it ISO-like, then parse
	const isoLike = mysqlDateTime.replace( ' ', 'T' ) + 'Z';
	return new Date( isoLike );
}

/**
 * Format a timestamp for display in conversation list
 * Shows "Today", "Yesterday", or date string
 * Handles MySQL datetime format: "2025-11-06 14:29:49"
 * @param timestamp
 */
export function formatConversationDate( timestamp: string ): string {
	// MySQL datetime format: "YYYY-MM-DD HH:MM:SS"
	// Replace space with 'T' to make it ISO-like, then parse
	const date = parseMySQLDateTime( timestamp );
	const today = new Date();
	const yesterday = new Date( today );
	yesterday.setDate( yesterday.getDate() - 1 );

	// Reset time to midnight for comparison
	const dateOnly = new Date( date.getFullYear(), date.getMonth(), date.getDate() );
	const todayOnly = new Date( today.getFullYear(), today.getMonth(), today.getDate() );
	const yesterdayOnly = new Date(
		yesterday.getFullYear(),
		yesterday.getMonth(),
		yesterday.getDate()
	);

	if ( dateOnly.getTime() === todayOnly.getTime() ) {
		return __( 'Today', '__i18n_text_domain__' );
	}

	if ( dateOnly.getTime() === yesterdayOnly.getTime() ) {
		return __( 'Yesterday', '__i18n_text_domain__' );
	}

	// Format as "Oct 7, 2025"
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

/**
 * Determine the bot type from bot_id or context
 * @param botId
 */
export function getBotType( botId?: string ): 'big-sky' | 'he' | 'odie' {
	if ( ! botId ) {
		return 'big-sky';
	}

	if ( botId.includes( 'happiness' ) || botId.includes( 'he' ) ) {
		return 'he';
	}

	if ( botId.includes( 'odie' ) ) {
		return 'odie';
	}

	return 'big-sky';
}
