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
					siteSlug
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
	siteSlug: string | null
): TranslateResult {
	const args = termsOfServiceRecord.args;
	if ( ! args ) {
		return '';
	}
	if ( doesTermsOfServiceRecordHaveDates( args ) ) {
		if ( args.is_renewal_price_prorated ) {
			const proratedRenewalArgs = {
				args: {
					endDate: moment( args.subscription_expiry_date ).format( 'll' ),
					numberOfDays: args.subscription_pre_renew_reminder_days || 7,
					productName: args.product_name,
					regularPrice: args.regular_renewal_price,
					renewalDate: moment( args.subscription_auto_renew_date ).format( 'll' ),
					renewalPrice: args.renewal_price,
					startDate: moment( args.subscription_start_date ).format( 'll' ),
				},
				components: {
					manageSubscriptionLink: (
						<a
							href={ `/purchases/subscriptions/${ siteSlug }` }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
					updatePaymentMethodLink: (
						<a
							href={ localizeUrl( EDIT_PAYMENT_DETAILS ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			};

			if ( args.product_meta && args.product_meta !== '' ) {
				return translate(
					'The promotional period for your %(productName)s subscription for %(domainName)s lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will attempt to renew your subscription at the reduced price of %(renewalPrice)s. All subsequent renewals will be charged for the regular subscription price of %(regularPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed, and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription{{/manageSubscriptionLink}} at any time.',
					{
						args: {
							...proratedRenewalArgs.args,
							domainName: args.product_meta,
						},
						components: {
							...proratedRenewalArgs.components,
						},
					}
				);
			}

			return translate(
				'The promotional period for your %(productName)s subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will attempt to renew your subscription at the reduced price of %(renewalPrice)s. All subsequent renewals will be charged for the regular subscription price of %(regularPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed, and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription{{/manageSubscriptionLink}} at any time.',
				proratedRenewalArgs
			);
		}

		const standardRenewalArgs = {
			args: {
				endDate: moment( args.subscription_expiry_date ).format( 'll' ),
				numberOfDays: args.subscription_pre_renew_reminder_days || 7,
				productName: args.product_name,
				renewalDate: moment( args.subscription_auto_renew_date ).format( 'll' ),
				renewalPrice: args.renewal_price,
				startDate: moment( args.subscription_start_date ).format( 'll' ),
			},
			components: {
				manageSubscriptionLink: (
					<a
						href={ `/purchases/subscriptions/${ siteSlug }` }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				updatePaymentMethodLink: (
					<a
						href={ localizeUrl( EDIT_PAYMENT_DETAILS ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		};

		if ( args.product_meta && args.product_meta !== '' ) {
			return translate(
				'The promotional period for your %(productName)s subscription for %(domainName)s lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will attempt to renew your subscription at the regular subscription price of %(renewalPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed, and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription{{/manageSubscriptionLink}} at any time.',
				{
					args: {
						...standardRenewalArgs.args,
						domainName: args.product_meta,
					},
					components: {
						...standardRenewalArgs.components,
					},
				}
			);
		}

		return translate(
			'The promotional period for your %(productName)s subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will attempt to renew your subscription at the regular subscription price of %(renewalPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed, and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription{{/manageSubscriptionLink}} at any time.',
			standardRenewalArgs
		);
	}

	if ( args.product_meta ) {
		return translate(
			'At the end of the promotional period your %(productName)s subscription for %(domainName)s will renew at the normal price of %(renewalPrice)s. You can add or update your payment method at any time {{link}}here{{/link}}.',
			{
				args: {
					productName: args.product_name,
					renewalPrice: args.renewal_price,
					domainName: args.product_meta,
				},
				components: {
					link: (
						<a
							href={ `/purchases/subscriptions/${ siteSlug }` }
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
				productName: args.product_name,
				renewalPrice: args.renewal_price,
			},
			components: {
				link: (
					<a
						href={ `/purchases/subscriptions/${ siteSlug }` }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);
}

function getMessageForTermsOfServiceRecord(
	termsOfServiceRecord: TermsOfServiceRecord,
	translate: ReturnType< typeof useTranslate >,
	siteSlug: string | null
): TranslateResult {
	switch ( termsOfServiceRecord.code ) {
		case 'terms_for_bundled_trial_unknown_payment_method':
			return getMessageForTermsOfServiceRecordUnknown( termsOfServiceRecord, translate, siteSlug );
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
