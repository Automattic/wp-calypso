import { sprintf } from '@wordpress/i18n';
import type { Quarter } from '../constants';

// "Q3 24" — short label used in delta pill, trend axis, and footer caption.
export function formatQuarterShort( { quarter, year }: Quarter ): string {
	return sprintf(
		/* translators: %1$d: quarter number, %2$d: 2-digit year. Example: Q3 24 */
		'Q%1$d %2$02d',
		quarter,
		year % 100
	);
}
