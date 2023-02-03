import { payment, receipt, tip } from '@wordpress/icons';
import { numberFormat, translate } from 'i18n-calypso';

interface Earnings {
	total_amount_owed?: number;
	total_earnings?: number;
}

export const highlightIconById = {
	earnings: payment,
	paid: receipt,
	'outstanding-amount': tip,
};

export function getAmountAsFormattedString( amount: number ) {
	if ( amount === 0 ) {
		// Per design spec we don't want "$0.00" as a result.
		// https://github.com/Automattic/wp-calypso/issues/72045
		// We'll return "$0" in this scenario.
		return '$0';
	}
	// Takes a Number, formats it to 2 decimal places, and prepends a "$".
	// Amounts are in USD with localized formatting.
	return '$' + numberFormat( amount, 2 );
}

export function getEarningsSummaryValues( earnings: Earnings ) {
	const total = earnings?.total_earnings ? Number( earnings.total_earnings ) : 0;
	const owed = earnings?.total_amount_owed ? Number( earnings.total_amount_owed ) : 0;
	const paid = total - owed;
	return {
		total,
		owed,
		paid,
	};
}

export function getPayoutNotices( earnings: Earnings ) {
	const amountOwed = earnings?.total_amount_owed || 0;
	const amountOwedFormatted = getAmountAsFormattedString( amountOwed );
	const notice = {
		id: 'notice',
		value: translate(
			'Outstanding amount of %(amountOwed)s does not exceed the minimum $100 needed to make the payment.',
			{
				comment: 'WordAds: Insufficient balance for payout.',
				args: { amountOwed: amountOwedFormatted },
			}
		),
	};
	const limit = {
		id: 'limit',
		value: translate(
			'Payment will be made as soon as the total outstanding amount has reached $100.',
			{
				comment: 'WordAds: Payout limit description.',
			}
		),
	};
	const payout = {
		id: 'payout',
		value: translate(
			'Outstanding amount of %(amountOwed)s will be paid approximately 45 days following the end of the month in which it was earned.',
			{
				comment: 'WordAds: Payout will proceed.',
				args: { amountOwed: amountOwedFormatted },
			}
		),
	};
	return amountOwed < 100 ? [ notice, limit ] : [ payout ];
}

export function getEarningsSummaries( earnings: Earnings ) {
	const { total, owed, paid } = getEarningsSummaryValues( earnings );

	return [
		{
			id: 'earnings',
			heading: translate( 'Earnings', { comment: 'Total WordAds earnings to date' } ),
			formattedAmount: getAmountAsFormattedString( total ),
		},
		{
			id: 'paid',
			heading: translate( 'Paid', {
				comment: 'Total WordAds earnings that have been paid out',
			} ),
			formattedAmount: getAmountAsFormattedString( paid ),
		},
		{
			id: 'outstanding-amount',
			heading: translate( 'Outstanding amount', {
				comment: 'Total WordAds earnings currently unpaid',
			} ),
			formattedAmount: getAmountAsFormattedString( owed ),
		},
	];
}
