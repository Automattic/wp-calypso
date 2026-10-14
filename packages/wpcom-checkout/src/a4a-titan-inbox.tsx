import { useLocale } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import type { Theme } from '@automattic/composite-checkout';
import type {
	IntroductoryOfferUnit,
	ResponseCart,
	ResponseCartProduct,
	TermsOfServiceRecordArgsBase,
	TermsOfServiceRecordArgsRenewal,
} from '@automattic/shopping-cart';

/**
 * Order details for the A4A Pressable Titan inbox add-on.
 *
 * The WordPress.com backend prepares this cart and owns every billing rule:
 * quantities, the trial, proration and renewal dates all arrive on the cart
 * product and its `terms_of_service` record. This module only reads them.
 */

export function isA4ATitanInboxProduct( product: ResponseCartProduct ): boolean {
	return typeof product.extra?.titan_domain === 'string' && product.extra.titan_domain !== '';
}

export interface A4ATitanInboxTerms {
	domain: string;
	currentQuantity: number;
	additionalQuantity: number;
	resultingQuantity: number;
	currency: string;
	dueTodayInteger: number;
	/**
	 * Set only when this purchase starts a new free trial. Increases during an
	 * existing trial keep its original end date and never get a new one.
	 */
	newTrial: { intervalUnit: IntroductoryOfferUnit; intervalCount: number } | null;
	/**
	 * ISO 8601 date of the next charge (the trial end for free carts), or null
	 * when the backend did not provide one.
	 */
	nextBillingDate: string | null;
	/**
	 * Full recurring price for the resulting quantity, or null when the
	 * backend did not provide one.
	 */
	renewalPriceInteger: number | null;
}

function getTermsOfServiceArgs(
	product: ResponseCartProduct,
	responseCart: ResponseCart
): TermsOfServiceRecordArgsBase | TermsOfServiceRecordArgsRenewal | undefined {
	return responseCart.terms_of_service?.find(
		( tos ) =>
			tos.key.includes( `product_id:${ product.product_id }` ) &&
			( ! product.meta || tos.key.includes( `meta:${ product.meta }` ) )
	)?.args;
}

export function getA4ATitanInboxTerms(
	product: ResponseCartProduct,
	responseCart: ResponseCart
): A4ATitanInboxTerms {
	const currentQuantity = product.current_quantity ?? 0;
	const resultingQuantity = product.quantity ?? currentQuantity;
	const dueTodayInteger = product.item_subtotal_integer;
	const tos = getTermsOfServiceArgs( product, responseCart );
	const offer = product.introductory_offer_terms;

	const newTrial =
		currentQuantity === 0 && dueTodayInteger === 0 && offer?.enabled && ! offer.reason
			? { intervalUnit: offer.interval_unit, intervalCount: offer.interval_count }
			: null;

	let nextBillingDate: string | null = null;
	if ( tos && 'subscription_auto_renew_date' in tos ) {
		nextBillingDate =
			dueTodayInteger === 0
				? tos.subscription_end_of_promotion_date
				: tos.subscription_auto_renew_date;
	}
	nextBillingDate ||= product.subscription_post_purchase_expiry_date ?? null;

	return {
		domain: product.extra?.titan_domain ?? '',
		currentQuantity,
		additionalQuantity: Math.max( 0, resultingQuantity - currentQuantity ),
		resultingQuantity,
		currency: product.currency,
		dueTodayInteger,
		newTrial,
		nextBillingDate,
		renewalPriceInteger: tos?.regular_renewal_price_integer ?? null,
	};
}

const Meta = styled.div< { theme?: Theme; compact?: boolean } >`
	color: ${ ( props ) => props.theme?.colors?.textColorLight };
	font-size: ${ ( props ) => ( props.compact ? 'inherit' : '14px' ) };
	overflow-wrap: anywhere;
	width: 100%;
`;

function formatIsoDate( isoDate: string, locale: string ): string {
	// Format only the date portion in local time so a UTC midnight does not
	// show as the previous day for users behind UTC.
	const [ year, month, day ] = isoDate.slice( 0, 10 ).split( '-' ).map( Number );
	const date = new Date( year, month - 1, day );
	if ( isNaN( date.getTime() ) ) {
		return '';
	}
	return new Intl.DateTimeFormat( locale, { dateStyle: 'long' } ).format( date );
}

function useTrialLabel( trial: A4ATitanInboxTerms[ 'newTrial' ] ): string {
	const translate = useTranslate();
	if ( ! trial ) {
		return '';
	}
	const args = { count: trial.intervalCount };
	switch ( trial.intervalUnit ) {
		case 'day':
			return translate( '%(count)d-day free trial', { args, textOnly: true } );
		case 'week':
			return translate( '%(count)d-week free trial', { args, textOnly: true } );
		case 'month':
			return translate( '%(count)d-month free trial', { args, textOnly: true } );
		case 'year':
			return translate( '%(count)d-year free trial', { args, textOnly: true } );
		default:
			return translate( 'Free trial', { textOnly: true } );
	}
}

function BillingTerms( { terms }: { terms: A4ATitanInboxTerms } ) {
	const translate = useTranslate();
	const locale = useLocale();
	const trialLabel = useTrialLabel( terms.newTrial );
	const money = ( amount: number ) =>
		formatCurrency( amount, terms.currency, { isSmallestUnit: true, stripZeros: true } );
	const dueToday = money( terms.dueTodayInteger );
	const date = terms.nextBillingDate ? formatIsoDate( terms.nextBillingDate, locale ) : '';
	const renewal = terms.renewalPriceInteger !== null ? money( terms.renewalPriceInteger ) : '';
	const total = terms.resultingQuantity;

	if ( terms.dueTodayInteger === 0 ) {
		return (
			<>
				<Meta>
					{ terms.newTrial
						? translate( '%(trial)s: %(amount)s due today.', {
								args: { trial: trialLabel, amount: dueToday },
							} )
						: translate( '%(amount)s due today, covered by your existing free trial.', {
								args: { amount: dueToday },
							} ) }
				</Meta>
				{ date && ! terms.newTrial && (
					<Meta>{ translate( 'Trial ends %(date)s (unchanged).', { args: { date } } ) }</Meta>
				) }
				{ date && renewal && (
					<Meta>
						{ translate(
							'Then %(price)s/month for %(total)d inbox starting %(date)s.',
							'Then %(price)s/month for all %(total)d inboxes starting %(date)s.',
							{ count: total, args: { price: renewal, total, date } }
						) }
					</Meta>
				) }
			</>
		);
	}

	return (
		<>
			<Meta>{ translate( 'Due today: %(amount)s.', { args: { amount: dueToday } } ) }</Meta>
			{ date && renewal && (
				<Meta>
					{ translate(
						'Renews %(date)s at %(price)s/month for %(total)d inbox.',
						'Renews %(date)s at %(price)s/month for all %(total)d inboxes.',
						{ count: total, args: { date, price: renewal, total } }
					) }
				</Meta>
			) }
			{ date && ! renewal && (
				<Meta>
					{ translate(
						'Renews %(date)s for %(total)d inbox.',
						'Renews %(date)s for all %(total)d inboxes.',
						{ count: total, args: { date, total } }
					) }
				</Meta>
			) }
		</>
	);
}

/**
 * Domain, inbox quantities and (unless `compact`) the amount due today
 * with the trial or renewal terms, all read from the prepared cart.
 */
export function A4ATitanInboxMeta( {
	product,
	responseCart,
	compact = false,
}: {
	product: ResponseCartProduct;
	responseCart: ResponseCart;
	compact?: boolean;
} ) {
	const translate = useTranslate();
	const terms = getA4ATitanInboxTerms( product, responseCart );
	const quantity =
		terms.currentQuantity > 0
			? translate(
					'Adding %(added)d inbox · %(total)d inboxes total',
					'Adding %(added)d inboxes · %(total)d inboxes total',
					{
						count: terms.additionalQuantity,
						args: { added: terms.additionalQuantity, total: terms.resultingQuantity },
						textOnly: true,
					}
				)
			: translate( '%(total)d inbox', '%(total)d inboxes', {
					count: terms.resultingQuantity,
					args: { total: terms.resultingQuantity },
					textOnly: true,
				} );

	return (
		<div className="a4a-titan-inbox-meta">
			<Meta compact={ compact }>{ `${ terms.domain } · ${ quantity }` }</Meta>
			{ ! compact && <BillingTerms terms={ terms } /> }
		</div>
	);
}
