/**
 * Badge copy for summary rows on the MCP hub.
 * @param {number} enabledCount
 * @param {number} total
 * @param {(text: string, options?: { args?: Record<string, number> }) => string} translate
 * @returns {{ text: string, intent?: 'default' | 'success' | 'warning' }}
 */
export function getAccessSummaryBadge( enabledCount, total, translate ) {
	if ( total === 0 ) {
		return { text: translate( 'None' ), intent: 'default' };
	}
	if ( enabledCount === 0 ) {
		return { text: translate( 'None enabled' ), intent: 'warning' };
	}
	if ( enabledCount === total ) {
		return { text: translate( 'All enabled' ), intent: 'success' };
	}
	return {
		text: translate( '%(enabled)d of %(total)d', {
			args: { enabled: enabledCount, total },
		} ),
		intent: 'default',
	};
}

/**
 * Badge for the Write row — Figma uses a neutral “Disabled” when no write tools are enabled.
 * @param {number} enabledCount
 * @param {number} total
 * @param {(text: string, options?: { args?: Record<string, number> }) => string} translate
 * @returns {{ text: string, intent?: 'default' | 'success' | 'warning' }}
 */
export function getWriteAccessBadge( enabledCount, total, translate ) {
	if ( total === 0 ) {
		return { text: translate( 'None' ), intent: 'default' };
	}
	if ( enabledCount === 0 ) {
		return { text: translate( 'Disabled' ), intent: 'default' };
	}
	if ( enabledCount === total ) {
		return { text: translate( 'All enabled' ), intent: 'success' };
	}
	return {
		text: translate( '%(enabled)d of %(total)d', {
			args: { enabled: enabledCount, total },
		} ),
		intent: 'default',
	};
}
