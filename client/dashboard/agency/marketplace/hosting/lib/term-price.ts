import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import type { TermPricing } from '../../use-term-pricing';

export interface TermPrice {
	/** The price to show, per month. */
	figure: string;
	suffix: string;
	/** With yearly billing, the yearly total as a note; empty otherwise. */
	billed: string;
}

/**
 * Hosting prices read per month. With yearly billing that is the yearly
 * amount over twelve, with the yearly total as a note, so the page never leads
 * with the full yearly figure (A4AD-268).
 */
export function getTermPrice( amount: number, currency: string, term: TermPricing ): TermPrice {
	if ( term === 'yearly' ) {
		return {
			figure: formatCurrency( amount / 12, currency ),
			suffix: __( '/month' ),
			billed: sprintf(
				/* translators: %s is the yearly total, e.g. "US$250.00". */
				__( 'Billed yearly, %s' ),
				formatCurrency( amount, currency )
			),
		};
	}
	return { figure: formatCurrency( amount, currency ), suffix: __( '/month' ), billed: '' };
}

/** A per-unit price (a WordPress.com site) per month. */
export const getMonthlyUnitPrice = ( amount: number, currency: string, term: TermPricing ) =>
	formatCurrency( term === 'yearly' ? amount / 12 : amount, currency );
