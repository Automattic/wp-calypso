import { localizeUrl } from '@automattic/i18n-utils';
import { TermsOfServiceRecord, useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import moment from 'moment';
import { EDIT_PAYMENT_DETAILS } from 'calypso/lib/url/support';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const debug = debugFactory( 'calypso:composite-checkout:additional-terms-of-service' );

/* eslint-disable wpcalypso/jsx-classname-namespace */

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

function getMessageForTermsOfServiceRecordPayPal(
	termsOfServiceRecord: TermsOfServiceRecord,
	translate: ReturnType< typeof useTranslate >,
	siteSlug: string | null
): TranslateResult {
	const args = termsOfServiceRecord.args;
	if ( ! args ) {
		return '';
	}
	if ( ! args.email || ! args.product_name || ! args.renewal_price ) {
		debug(
			`Malformed terms of service args with code: ${ termsOfServiceRecord.code }`,
			termsOfServiceRecord
		);
		return '';
	}
	if (
		args.subscription_start_date &&
		args.subscription_expiry_date &&
		args.subscription_auto_renew_date
	) {
		if ( args.is_renewal_price_prorated ) {
			return translate(
				'The promotional period for your subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will charge your payment method (PAYPAL %(email)s) for %(renewalPrice)s. All subsequent renewals will be charged for the regular subscription price of %(regularPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription{{/manageSubscriptionLink}} at any time.',
				{
					args: {
						startDate: moment( args.subscription_start_date ).format( 'll' ),
						endDate: moment( args.subscription_expiry_date ).format( 'll' ),
						renewalDate: moment( args.subscription_auto_renew_date ).format( 'll' ),
						email: args.email,
						renewalPrice: args.renewal_price,
						regularPrice: args.regular_renewal_price,
						numberOfDays: args.subscription_pre_renew_reminder_days || 7,
					},
					components: {
						updatePaymentMethodLink: (
							<a
								href={ localizeUrl( EDIT_PAYMENT_DETAILS ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						manageSubscriptionLink: (
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
			'The promotional period for your subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will begin charging your payment method (PAYPAL %(email)s) the regular subscription price of %(renewalPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription{{/manageSubscriptionLink}} at any time.',
			{
				args: {
					startDate: moment( args.subscription_start_date ).format( 'll' ),
					endDate: moment( args.subscription_expiry_date ).format( 'll' ),
					renewalDate: moment( args.subscription_auto_renew_date ).format( 'll' ),
					email: args.email,
					renewalPrice: args.renewal_price,
					numberOfDays: args.subscription_pre_renew_reminder_days || 7,
				},
				components: {
					updatePaymentMethodLink: (
						<a
							href={ localizeUrl( EDIT_PAYMENT_DETAILS ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
					manageSubscriptionLink: (
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
		'At the end of the promotional period we will begin charging your PayPal account (%(email)s) the normal %(productName)s subscription price of %(renewalPrice)s. You can update the payment method at any time {{link}}here{{/link}}',
		{
			args: {
				email: args.email,
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

function getMessageForTermsOfServiceRecordCard(
	termsOfServiceRecord: TermsOfServiceRecord,
	translate: ReturnType< typeof useTranslate >,
	siteSlug: string | null
): TranslateResult {
	const args = termsOfServiceRecord.args;
	if ( ! args ) {
		return '';
	}
	if ( ! args.card_type || ! args.card_last_4 || ! args.product_name || ! args.renewal_price ) {
		debug(
			`Malformed terms of service args with code: ${ termsOfServiceRecord.code }`,
			termsOfServiceRecord
		);
		return '';
	}
	if (
		args.subscription_start_date &&
		args.subscription_expiry_date &&
		args.subscription_auto_renew_date
	) {
		if ( args.is_renewal_price_prorated ) {
			return translate(
				'The promotional period for your subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will charge your payment method (%(cardType)s ****%(cardLast4)s) for %(renewalPrice)s. All subsequent renewals will be charged for the regular subscription price of %(regularPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription{{/manageSubscriptionLink}} at any time.',
				{
					args: {
						startDate: moment( args.subscription_start_date ).format( 'll' ),
						endDate: moment( args.subscription_expiry_date ).format( 'll' ),
						renewalDate: moment( args.subscription_auto_renew_date ).format( 'll' ),
						cardType: args.card_type,
						cardLast4: args.card_last_4,
						renewalPrice: args.renewal_price,
						regularPrice: args.regular_renewal_price,
						numberOfDays: args.subscription_pre_renew_reminder_days || 7,
					},
					components: {
						updatePaymentMethodLink: (
							<a
								href={ localizeUrl( EDIT_PAYMENT_DETAILS ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						manageSubscriptionLink: (
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
			'The promotional period for your subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will begin charging your payment method (%(cardType)s ****%(cardLast4)s) the regular subscription price of %(renewalPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionLink}}manage your subscription {{/manageSubscriptionLink}} at any time.',
			{
				args: {
					startDate: moment( args.subscription_start_date ).format( 'll' ),
					endDate: moment( args.subscription_expiry_date ).format( 'll' ),
					renewalDate: moment( args.subscription_auto_renew_date ).format( 'll' ),
					cardType: args.card_type,
					cardLast4: args.card_last_4,
					renewalPrice: args.renewal_price,
					numberOfDays: args.subscription_pre_renew_reminder_days || 7,
				},
				components: {
					updatePaymentMethodLink: (
						<a
							href={ localizeUrl( EDIT_PAYMENT_DETAILS ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
					manageSubscriptionLink: (
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
		'At the end of the promotional period we will begin charging your %(cardType)s card ending in %(cardLast4)s the normal %(productName)s subscription price of %(renewalPrice)s. You can update the payment method at any time {{link}}here{{/link}}',
		{
			args: {
				cardType: args.card_type,
				cardLast4: args.card_last_4,
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

function getMessageForTermsOfServiceRecordUnknown(
	termsOfServiceRecord: TermsOfServiceRecord,
	translate: ReturnType< typeof useTranslate >,
	siteSlug: string | null
): TranslateResult {
	const args = termsOfServiceRecord.args;
	if ( ! args ) {
		return '';
	}
	if (
		args.subscription_start_date &&
		args.subscription_expiry_date &&
		args.subscription_auto_renew_date
	) {
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

	const defaultRenewalArgs = {
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
	};

	if ( args.product_meta && args.product_meta !== '' ) {
		return translate(
			'At the end of the promotional period your %(productName)s subscription for %(domainName)s will renew at the normal price of %(renewalPrice)s. You can add or update your payment method at any time {{link}}here{{/link}}.',
			{
				args: {
					...defaultRenewalArgs.args,
					domainName: args.product_meta,
				},
				components: {
					...defaultRenewalArgs.components,
				},
			}
		);
	}

	return translate(
		'At the end of the promotional period your %(productName)s subscription will renew at the normal price of %(renewalPrice)s. You can add or update your payment method at any time {{link}}here{{/link}}.',
		defaultRenewalArgs
	);
}

function getMessageForTermsOfServiceRecord(
	termsOfServiceRecord: TermsOfServiceRecord,
	translate: ReturnType< typeof useTranslate >,
	siteSlug: string | null
): TranslateResult {
	switch ( termsOfServiceRecord.code ) {
		case 'terms_for_bundled_trial_auto_renewal_paypal':
			return getMessageForTermsOfServiceRecordPayPal( termsOfServiceRecord, translate, siteSlug );
		case 'terms_for_bundled_trial_auto_renewal_credit_card':
			return getMessageForTermsOfServiceRecordCard( termsOfServiceRecord, translate, siteSlug );
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
