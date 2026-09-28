/**
 * Badge copy for summary rows on the MCP hub.
 * @param {number} enabledCount
 * @param {number} total
 * @param {(text: string, options?: { args?: Record<string, number> }) => string} translate
 * @returns {{ text: string, intent?: 'draft' | 'stable' | 'informational' }}
 */
export function getAccessSummaryBadge( enabledCount, total, translate ) {
	if ( total === 0 ) {
		return { text: translate( 'None' ), intent: 'draft' };
	}
	if ( enabledCount === 0 ) {
		return { text: translate( 'None enabled' ), intent: 'draft' };
	}
	if ( enabledCount === total ) {
		return { text: translate( 'All enabled' ), intent: 'stable' };
	}
	return {
		text: translate( '%(enabled)d of %(total)d enabled', {
			args: { enabled: enabledCount, total },
		} ),
		intent: 'informational',
	};
}

/**
 * Badge for the Write row — Figma uses a neutral “Disabled” when no write tools are enabled.
 * @param {number} enabledCount
 * @param {number} total
 * @param {(text: string, options?: { args?: Record<string, number> }) => string} translate
 * @returns {{ text: string, intent?: 'draft' | 'stable' | 'informational' }}
 */
export function getWriteAccessBadge( enabledCount, total, translate ) {
	if ( total === 0 ) {
		return { text: translate( 'None' ), intent: 'draft' };
	}
	if ( enabledCount === 0 ) {
		return { text: translate( 'Disabled' ), intent: 'draft' };
	}
	if ( enabledCount === total ) {
		return { text: translate( 'All enabled' ), intent: 'stable' };
	}
	return {
		text: translate( '%(enabled)d of %(total)d enabled', {
			args: { enabled: enabledCount, total },
		} ),
		intent: 'informational',
	};
}
