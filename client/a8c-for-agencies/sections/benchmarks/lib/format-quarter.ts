import { __, sprintf } from '@wordpress/i18n';
import type { Quarter } from '../constants';

// "Q3 24" — short label used in delta pill, trend axis, and footer caption.
export function formatQuarterShort( { quarter, year }: Quarter ): string {
	return sprintf(
		/* translators: %1$d: quarter number, %2$d: 2-digit year. Example: Q3 24 */
		__( 'Q%1$d %2$02d' ),
		quarter,
		year % 100
	);
}

// "Q3 2024" — full label used in the header quarter selector and related copy.
export function formatQuarterLong( { quarter, year }: Quarter ): string {
	return sprintf(
		/* translators: %1$d: quarter number, %2$d: 4-digit year. Example: Q3 2024 */
		__( 'Q%1$d %2$d' ),
		quarter,
		year
	);
}
