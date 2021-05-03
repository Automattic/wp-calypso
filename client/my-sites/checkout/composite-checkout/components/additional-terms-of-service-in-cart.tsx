/**
 * External dependencies
 */
import React from 'react';
import { TermsOfServiceRecord, useShoppingCart } from '@automattic/shopping-cart';
import i18nCalypso, { useTranslate, TranslateResult } from 'i18n-calypso';
import { useLocale } from '@automattic/i18n-utils';
import { useSelector } from 'react-redux';
import debugFactory from 'debug';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { EDIT_PAYMENT_DETAILS } from 'calypso/lib/url/support';
import Gridicon from 'calypso/components/gridicon';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const debug = debugFactory( 'calypso:composite-checkout:additional-terms-of-service' );

/* eslint-disable wpcalypso/jsx-classname-namespace */

export default function AdditionalTermsOfServiceInCart(): JSX.Element | null {
	const translate = useTranslate();
	const locale = useLocale();
	const { responseCart } = useShoppingCart();
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
					locale,
					siteSlug
				);

				if ( ! message ) {
					return null;
				}

				return (
					<div className="checkout__titan-terms-of-service" key={ termsOfServiceRecord.key }>
						<Gridicon icon="info-outline" size={ 18 } />
						<p>{ message }</p>
					</div>
				);
			} ) }
		</>
	);
}

function getMessageForTermsOfServiceRecord(
	termsOfServiceRecord: TermsOfServiceRecord,
	translate: ReturnType< typeof useTranslate >,
	locale: string,
	siteSlug: string | null
): TranslateResult {
	const { args = {} } = termsOfServiceRecord;
	switch ( termsOfServiceRecord.code ) {
		case 'terms_for_bundled_trial_auto_renewal_paypal':
			if ( ! args.email || ! args.product_name || ! args.renewal_price ) {
				debug(
					`Malformed terms of service args with code: ${ termsOfServiceRecord.code }`,
					termsOfServiceRecord
				);
				return '';
			}
			if (
				( locale === 'en' ||
					i18nCalypso.hasTranslation(
						'The promotional period for your subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will begin charging your payment method (PAYPAL %(email)s) the regular subscription price of %(renewalPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionlink}}manage your subscription {{/manageSubscriptionlink}} at any time.'
					) ) &&
				args.subscription_start_date &&
				args.subscription_expiry_date &&
				args.subscription_auto_renew_date
			) {
				return translate(
					'The promotional period for your subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will begin charging your payment method (PAYPAL %(email)s) the regular subscription price of %(renewalPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionlink}}manage your subscription {{/manageSubscriptionlink}} at any time.',
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
								<a href={ EDIT_PAYMENT_DETAILS } target="_blank" rel="noopener noreferrer" />
							),
							manageSubscriptionlink: (
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
		case 'terms_for_bundled_trial_auto_renewal_credit_card':
			if ( ! args.card_type || ! args.card_last_4 || ! args.product_name || ! args.renewal_price ) {
				debug(
					`Malformed terms of service args with code: ${ termsOfServiceRecord.code }`,
					termsOfServiceRecord
				);
				return '';
			}
			if (
				( locale === 'en' ||
					i18nCalypso.hasTranslation(
						'The promotional period for your subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will begin charging your payment method (PAYPAL %(email)s) the regular subscription price of %(renewalPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionlink}}manage your subscription {{/manageSubscriptionlink}} at any time.'
					) ) &&
				args.subscription_start_date &&
				args.subscription_expiry_date &&
				args.subscription_auto_renew_date
			) {
				return translate(
					'The promotional period for your subscription lasts from %(startDate)s to %(endDate)s. On %(renewalDate)s we will begin charging your payment method (%(cardType)s ****%(cardLast4)s) the regular subscription price of %(renewalPrice)s. You will receive at least one email notice %(numberOfDays)d days before being billed and can {{updatePaymentMethodLink}}update your payment method{{/updatePaymentMethodLink}} or {{manageSubscriptionlink}}manage your subscription {{/manageSubscriptionlink}} at any time.',
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
								<a href={ EDIT_PAYMENT_DETAILS } target="_blank" rel="noopener noreferrer" />
							),
							manageSubscriptionlink: (
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
		default:
			debug(
				`Unknown terms of service code: ${ termsOfServiceRecord.code }`,
				termsOfServiceRecord
			);
			return '';
	}
}
