import { formatCurrency } from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	TermsOfServiceRecord,
	TermsOfServiceRecordArgsRenewal,
	useShoppingCart,
} from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import moment from 'moment';
import { EDIT_PAYMENT_DETAILS } from 'calypso/lib/url/support';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const debug = debugFactory( 'calypso:composite-checkout:additional-terms-of-service' );

export default function AdditionalTermsOfServiceInCart() {
	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const siteSlug = useSelector( getSelectedSiteSlug );

	if ( ! responseCart.terms_of_service || responseCart.terms_of_service.length === 0 ) {
		return null;
	}

	return (
		<>
			{ responseCart.terms_of_service.map( ( termsOfServiceRecord ) => {
				const message = getMessageForTermsOfServiceRecord(
					termsOfServiceRecord,
					translate,
					siteSlug,
					responseCart.currency
				);

				if ( ! message ) {
					return null;
				}

				return <CheckoutTermsItem key={ termsOfServiceRecord.key }>{ message }</CheckoutTermsItem>;
			} ) }
		</>
	);
}

function getMessageForTermsOfServiceRecordUnknown(
	termsOfServiceRecord: TermsOfServiceRecord,
	translate: ReturnType< typeof useTranslate >,
	siteSlug: string | null,
	currency: string
): TranslateResult {
	const args = termsOfServiceRecord.args;
	if ( ! args ) {
		return '';
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
	const startDate = moment( args.subscription_start_date ).format( 'll' );
	const manageSubscriptionLink = `/purchases/subscriptions/${ siteSlug }`;

	if ( doesTermsOfServiceRecordHaveDates( args ) ) {
		const endDate = moment( args.subscription_end_of_promotion_date ).format( 'll' );
		const numberOfDays = args.subscription_pre_renew_reminder_days || 7;
		const maybeProratedRegularPrice = formatCurrency(
			args.maybe_prorated_regular_renewal_price_integer,
			currency,
			{
				isSmallestUnit: true,
				stripZeros: true,
			}
		);
		const renewalDate = moment( args.subscription_auto_renew_date ).format( 'll' );

		return translate(
			'The promotional period for your %(productName)s subscription lasts from %(startDate)s to %(endDate)s. You will next be charged %(renewalPrice)s on %(renewalDate)s. On %(endDate)s, we will attempt to renew your subscription for %(maybeProratedRegularPrice)s. Subsequent renewals will be %(regularPrice)s. You will receive email notices %(numberOfDays)d days before renewals, and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription{{/manageSubscriptionLink}} at any time.',
			{
				args: {
					productName,
					startDate,
					endDate,
					renewalPrice,
					renewalDate,
					maybeProratedRegularPrice,
					regularPrice,
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
	}

	return translate(
		'At the end of the promotional period your %(productName)s subscription will renew at the normal price of %(renewalPrice)s. You can add or update your payment method at any time {{link}}here{{/link}}.',
		{
			args: {
				productName,
				renewalPrice,
			},
			components: {
				link: <a href={ manageSubscriptionLink } target="_blank" rel="noopener noreferrer" />,
			},
		}
	);
}

function getMessageForTermsOfServiceRecord(
	termsOfServiceRecord: TermsOfServiceRecord,
	translate: ReturnType< typeof useTranslate >,
	siteSlug: string | null,
	currency: string
): TranslateResult {
	switch ( termsOfServiceRecord.code ) {
		case 'terms_for_bundled_trial_unknown_payment_method':
			return getMessageForTermsOfServiceRecordUnknown(
				termsOfServiceRecord,
				translate,
				siteSlug,
				currency
			);
		default:
			debug(
				`Unknown terms of service code: ${ termsOfServiceRecord.code }`,
				termsOfServiceRecord
			);
			return '';
	}
}

function doesTermsOfServiceRecordHaveDates(
	args: TermsOfServiceRecord[ 'args' ]
): args is TermsOfServiceRecordArgsRenewal {
	const argsWithDates = args as TermsOfServiceRecordArgsRenewal;
	return Boolean( argsWithDates.subscription_expiry_date );
}
