import { formatCurrency } from '@automattic/format-currency';
import { localizeUrl, useIsEnglishLocale } from '@automattic/i18n-utils';
import {
	TermsOfServiceRecord,
	TermsOfServiceRecordArgsRenewal,
	useShoppingCart,
} from '@automattic/shopping-cart';
import { EDIT_PAYMENT_DETAILS } from '@automattic/urls';
import { hasTranslation } from '@wordpress/i18n';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const debug = debugFactory( 'calypso:composite-checkout:additional-terms-of-service' );

export default function AdditionalTermsOfServiceInCart() {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const siteSlug = useSelector( getSelectedSiteSlug );

	if ( ! responseCart.terms_of_service || responseCart.terms_of_service.length === 0 ) {
		return null;
	}

	return (
		<>
			{ responseCart.terms_of_service.map( ( termsOfServiceRecord ) => {
				const message = (
					<MessageForTermsOfServiceRecord
						termsOfServiceRecord={ termsOfServiceRecord }
						siteSlug={ siteSlug }
						currency={ responseCart.currency }
					/>
				);

				if ( ! message ) {
					return null;
				}

				return <CheckoutTermsItem key={ termsOfServiceRecord.key }>{ message }</CheckoutTermsItem>;
			} ) }
		</>
	);
}

function formatDate( isoDate: string ): string {
	// This somewhat mimics `moment.format('ll')` (used here formerly) without
	// needing the depdecated `moment` package.
	return new Date( Date.parse( isoDate ) ).toLocaleDateString( 'en-US', {
		weekday: undefined,
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	} );
}

function MessageForTermsOfServiceRecordUnknown( {
	termsOfServiceRecord,
	siteSlug,
	currency,
}: {
	termsOfServiceRecord: TermsOfServiceRecord;
	siteSlug: string | null;
	currency: string;
} ): ReactNode {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const args = termsOfServiceRecord.args;
	if ( ! args ) {
		return null;
	}

	const productName = args.product_name + ( args.product_meta ? ` (${ args.product_meta })` : '' );
	const regularPrice = formatCurrency( args.regular_renewal_price_integer, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
	const renewalPrice = formatCurrency( args.renewal_price_integer, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
	const startDate = formatDate( args.subscription_start_date );
	const maybeProratedRegularPrice = formatCurrency(
		args.maybe_prorated_regular_renewal_price_integer,
		currency,
		{
			isSmallestUnit: true,
			stripZeros: true,
		}
	);
	const manageSubscriptionLink = `/purchases/subscriptions/${ siteSlug }`;

	if ( doesTermsOfServiceRecordHaveDates( args ) ) {
		const promotionEndDate = formatDate( args.subscription_end_of_promotion_date );
		const subscriptionEndDate = formatDate( args.subscription_expiry_date );
		const numberOfDays = args.subscription_pre_renew_reminder_days || 7;
		const renewalDate = formatDate( args.subscription_auto_renew_date );
		const proratedRenewalDate = formatDate(
			args.subscription_maybe_prorated_regular_auto_renew_date
		);

		const termLengthText = translate(
			'The promotional period for your {{b}}%(productName)s{{/b}} subscription lasts from %(startDate)s to %(endDate)s.',
			{
				args: {
					productName,
					startDate,
					endDate: promotionEndDate,
				},
				components: {
					b: <strong />,
				},
			}
		);
		const isRenewalTermLengthTextTranslated =
			isEnglishLocale ||
			hasTranslation(
				'After you renew today, your %(productName)s subscription will last until %(endDate)s.'
			);
		const renewalTermLengthText = translate(
			'After you renew today, your %(productName)s subscription will last until %(endDate)s.',
			{
				args: {
					productName,
					endDate: subscriptionEndDate,
				},
			}
		);

		const nextRenewalText = translate(
			'You will next be charged %(renewalPrice)s on %(renewalDate)s.',
			{
				args: {
					renewalPrice,
					renewalDate,
				},
			}
		);

		// This is necessary to add if the next renewal is not the end of the offer.
		const endOfPromotionChargeText = translate(
			'On %(endDate)s, we will attempt to renew your subscription for %(maybeProratedRegularPrice)s.',
			{
				args: {
					endDate: proratedRenewalDate,
					maybeProratedRegularPrice,
				},
			}
		);

		const regularPriceNoticeText = translate( 'Subsequent renewals will be %(regularPrice)s.', {
			args: {
				regularPrice,
			},
		} );

		const emailNoticesText = translate(
			'You will receive an email notice %(numberOfDays)d days before being billed, and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription{{/manageSubscriptionLink}} at any time.',
			{
				args: {
					numberOfDays,
				},
				components: {
					manageSubscriptionLink: (
						<a href={ manageSubscriptionLink } target="_blank" rel="noopener noreferrer" />
					),
					updatePaymentMethodLink: (
						<a
							href={ localizeUrl( EDIT_PAYMENT_DETAILS ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		);

		const taxesNotIncludedText = translate( 'Prices do not include applicable taxes.' );

		// No need to show the endOfPromotionChargeText if the price and date
		// we are already showing as the next renewal info is the same as the
		// end of promotion renewal info.
		const shouldShowEndOfPromotionText =
			// Show the endOfPromotionChargeText if the proratedRenewalDate differs from
			// the renewalDate because it is about the proratedRenewalDate.
			renewalDate !== proratedRenewalDate ||
			// Show the endOfPromotionChargeText if the
			// maybeProratedRegularPrice differs from the renewalPrice because
			// it is about the maybeProratedRegularPrice.
			renewalPrice !== maybeProratedRegularPrice;

		const shouldShowRegularPriceNoticeText = ( () => {
			// No need to show the regularPriceNoticeText if the price we are
			// already showing as the next renewal price is the same as the
			// regular renewal price, as long as there is no end of promotion
			// text to mislead the reader into thinking it referrs to all
			// renewals.
			if ( ! shouldShowEndOfPromotionText && regularPrice === renewalPrice ) {
				return false;
			}
			// No need to show the regularPriceNoticeText if the price we are
			// already showing as the end of promotion renewal price is the
			// same as the regular renewal price.
			if ( shouldShowEndOfPromotionText && regularPrice === maybeProratedRegularPrice ) {
				return false;
			}
			return true;
		} )();

		const shouldShowRenewalTermText =
			isRenewalTermLengthTextTranslated &&
			args.is_renewal &&
			args.remaining_promotional_auto_renewals === 0;

		return (
			<>
				{ shouldShowRenewalTermText ? renewalTermLengthText : termLengthText } { nextRenewalText }{ ' ' }
				{ shouldShowEndOfPromotionText && endOfPromotionChargeText }{ ' ' }
				{ shouldShowRegularPriceNoticeText && regularPriceNoticeText } { taxesNotIncludedText }{ ' ' }
				{ emailNoticesText }{ ' ' }
			</>
		);
	}

	return translate(
		'At the end of the promotional period your %(productName)s subscription will renew for %(maybeProratedRegularPrice)s. Subsequent renewals will be %(regularPrice)s. You can add or update your payment method at any time {{link}}here{{/link}}.',
		{
			args: {
				productName,
				maybeProratedRegularPrice,
				regularPrice,
			},
			components: {
				link: <a href={ manageSubscriptionLink } target="_blank" rel="noopener noreferrer" />,
			},
		}
	);
}

function MessageForTermsOfServiceRecord( {
	termsOfServiceRecord,
	siteSlug,
	currency,
}: {
	termsOfServiceRecord: TermsOfServiceRecord;
	siteSlug: string | null;
	currency: string;
} ) {
	switch ( termsOfServiceRecord.code ) {
		case 'terms_for_bundled_trial_unknown_payment_method':
			return (
				<MessageForTermsOfServiceRecordUnknown
					termsOfServiceRecord={ termsOfServiceRecord }
					siteSlug={ siteSlug }
					currency={ currency }
				/>
			);
		default:
			debug(
				`Unknown terms of service code: ${ termsOfServiceRecord.code }`,
				termsOfServiceRecord
			);
			return null;
	}
}

function doesTermsOfServiceRecordHaveDates(
	args: TermsOfServiceRecord[ 'args' ]
): args is TermsOfServiceRecordArgsRenewal {
	const argsWithDates = args as TermsOfServiceRecordArgsRenewal;
	return Boolean( argsWithDates.subscription_expiry_date );
}
