import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import type { TermPricing } from '../../use-term-pricing';

export interface TermPrice {
	price: string;
	/** With yearly billing, the yearly total as a note; empty otherwise. */
	billed: string;
}

/**
 * Hosting prices always read per month. `amount` is the price for the term the
 * page shows; `billingTerm` is how it's billed, which differs when a product
 * only has one term. Billed yearly, the yearly total becomes a note.
 */
export function getTermPrice(
	amount: number,
	currency: string,
	term: TermPricing,
	billingTerm: TermPricing = term
): TermPrice {
	const perMonth = term === 'yearly' ? amount / 12 : amount;
	return {
		price: formatCurrency( perMonth, currency ),
		billed:
			billingTerm === 'yearly'
				? sprintf(
						/* translators: %s is the yearly total, e.g. "US$250.00". */
						__( 'Billed yearly, %s' ),
						formatCurrency( perMonth * 12, currency )
					)
				: '',
	};
}
