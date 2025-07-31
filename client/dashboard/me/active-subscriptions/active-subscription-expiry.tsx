import { formatCurrency } from '@automattic/number-formatters';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { formatDate } from '../../utils/datetime';
import {
	isTemporarySitePurchase,
	isA4ATemporarySitePurchase,
	isRecentMonthlyPurchase,
	getRelativeTimeString,
	isRenewing,
	isExpiring,
	isExpired,
	isIncludedWithPlan,
	isOneTimePurchase,
	isAkismetFreeProduct,
	isWithinNext,
	isWithinLast,
	creditCardHasAlreadyExpired,
	creditCardExpiresBeforeSubscription,
	PLAN_MONTHLY_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from './util';
import type { ActiveSubscription } from '../../data/me-active-subscriptions';

export function ActiveSubscriptionExpiry( {
	purchase,
	isJetpack,
	isDisconnectedSite,
}: {
	purchase: ActiveSubscription;
	isJetpack?: boolean;
	isDisconnectedSite?: boolean;
} ) {
	const locale = useLocale();

	// @todo: There isn't currently a way to get the taxName based on the
	// country. The country is not included in the purchase information
	// envelope. We should add this information so we can utilize useTaxName
	// to retrieve the correct taxName. For now, we are using a fallback tax
	// name with context, to prevent mis-translation.
	// translators: Shortened form of 'Sales Tax', not a country-specific tax name
	const taxName = __( 'tax' );

	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const excludeTaxStringAbbreviation = sprintf( __( '(excludes %s)' ), [ taxName ] );

	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const excludeTaxStringTitle = sprintf( __( 'Renewal price excludes any applicable %s' ), [
		taxName,
	] );

	if ( purchase.partner_name ) {
		// translators: partnerName is the name of the partner service who manages this product
		return sprintf( __( 'Managed by %(partnerName)s' ), {
			partnerName: purchase.partner_name,
		} );
	}

	if (
		isDisconnectedSite &&
		isTemporarySitePurchase( purchase ) &&
		purchase.product_type === 'jetpack'
	) {
		return (
			<>
				<span className="purchase-item__is-error">
					{ __( 'Activate your product license key' ) }
				</span>
				<br />
				<ExternalLink
					className="purchase-item__link"
					href="https://jetpack.com/support/activate-a-jetpack-product-via-license-key/"
				>
					{ __( 'Learn more' ) }
				</ExternalLink>
			</>
		);
	}

	const isA4APurchase = isA4ATemporarySitePurchase( purchase );
	const temporarySitePurchaseProductTypes = [ 'saas_plugin', 'jetpack', 'akismet' ];
	const isKnownTemporarySiteProductType =
		isTemporarySitePurchase( purchase ) &&
		temporarySitePurchaseProductTypes.includes( purchase.product_type );

	if ( isDisconnectedSite && ! isA4APurchase && ! isKnownTemporarySiteProductType && isJetpack ) {
		return (
			<span className="purchase-item__is-error">{ __( 'Disconnected from WordPress.com' ) }</span>
		);
	}

	if ( isDisconnectedSite && ! isA4APurchase && ! isKnownTemporarySiteProductType ) {
		return (
			<span className="purchase-item__is-error">
				{ createInterpolateElement(
					__(
						'You no longer have access to this site and its purchases. <button>Contact support</button>'
					),
					{
						button: <a href="/help/contact" />,
					}
				) }
			</span>
		);
	}

	if ( purchase.is_iap_purchase && purchase.iap_purchase_management_link ) {
		return createInterpolateElement(
			__(
				'This product is an in-app purchase. You can manage it from within <managePurchase>the app store</managePurchase>.'
			),
			{
				managePurchase: <a href={ purchase.iap_purchase_management_link } />,
			}
		);
	}

	const isIntroductoryOfferFreeTrial = purchase.introductory_offer?.cost_per_interval === 0;
	if (
		purchase.introductory_offer?.is_within_period &&
		isIntroductoryOfferFreeTrial &&
		isRenewing( purchase )
	) {
		return createInterpolateElement(
			sprintf(
				// translators: date is a formatted date, amount is a currency amount, and excludeTaxStringAbbreviation is something like "excludes VAT"
				__(
					'Free trial ends on <span>%(date)s</span>, renews automatically at %(amount)s <abbr>%(excludeTaxStringAbbreviation)s</abbr>'
				),
				{
					date: formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
					amount: formatCurrency( purchase.price_integer, purchase.currency_code, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
					excludeTaxStringAbbreviation: excludeTaxStringAbbreviation,
				}
			),
			{
				span: <span className="purchase-item__date" />,
				abbr: <abbr title={ excludeTaxStringTitle } />,
			}
		);
	}

	if ( purchase.introductory_offer?.is_within_period && isIntroductoryOfferFreeTrial ) {
		return (
			<span>
				{ createInterpolateElement(
					// translators: date is a formatted date
					sprintf( __( 'Free trial ends on <span>%(date)s</span>' ), {
						date: formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
					} ),
					{
						span: <span className="purchase-item__date" />,
					}
				) }
			</span>
		);
	}

	const isRenewingOnDate = Boolean( isRenewing( purchase ) && purchase.renew_date );
	if ( isRenewingOnDate && creditCardHasAlreadyExpired( purchase ) ) {
		return <span className="purchase-item__is-error">{ __( 'Credit card expired' ) }</span>;
	}

	if ( isRenewingOnDate && creditCardExpiresBeforeSubscription( purchase ) ) {
		return (
			<span className="purchase-item__is-warning">
				{ createInterpolateElement(
					sprintf(
						// translators: date is a formatted date
						__( 'Credit card expires before your next renewal on <span>%(date)s</span>' ),
						{
							date: formatDate( new Date( purchase.renew_date ), locale, { dateStyle: 'long' } ),
						}
					),
					{
						span: <span className="purchase-item__date" />,
					}
				) }
			</span>
		);
	}

	if ( isRenewingOnDate && purchase.bill_period_days ) {
		const translateArgs = {
			amount: formatCurrency( purchase.price_integer, purchase.currency_code, {
				isSmallestUnit: true,
				stripZeros: true,
			} ),
			excludeTaxStringAbbreviation: excludeTaxStringAbbreviation,
			date: formatDate( new Date( purchase.renew_date ), locale, { dateStyle: 'long' } ),
		};
		const translateComponents = {
			abbr: <abbr title={ excludeTaxStringTitle } />,
			span: <span className="purchase-item__date" />,
		};
		switch ( purchase.bill_period_days ) {
			case PLAN_MONTHLY_PERIOD:
				return createInterpolateElement(
					sprintf(
						// translators: date is a formatted date, amount is a currency amount, and excludeTaxStringAbbreviation is something like "excludes VAT"
						__(
							'Renews monthly at %(amount)s <abbr>%(excludeTaxStringAbbreviation)s</abbr> on <span>%(date)s</span>'
						),
						translateArgs
					),
					translateComponents
				);
			case PLAN_ANNUAL_PERIOD:
				return createInterpolateElement(
					sprintf(
						// translators: date is a formatted date, amount is a currency amount, and excludeTaxStringAbbreviation is something like "excludes VAT"
						__(
							'Renews yearly at %(amount)s <abbr>%(excludeTaxStringAbbreviation)s</abbr> on <span>%(date)s</span>'
						),
						translateArgs
					),
					translateComponents
				);
			case PLAN_BIENNIAL_PERIOD:
				return createInterpolateElement(
					sprintf(
						// translators: date is a formatted date, amount is a currency amount, and excludeTaxStringAbbreviation is something like "excludes VAT"
						__(
							'Renews every two years at %(amount)s <abbr>%(excludeTaxStringAbbreviation)s</abbr> on <span>%(date)s</span>'
						),
						translateArgs
					),
					translateComponents
				);
			case PLAN_TRIENNIAL_PERIOD:
				return createInterpolateElement(
					sprintf(
						// translators: date is a formatted date, amount is a currency amount, and excludeTaxStringAbbreviation is something like "excludes VAT"
						__(
							'Renews every three years at %(amount)s <abbr>%(excludeTaxStringAbbreviation)s</abbr> on <span>%(date)s</span>'
						),
						translateArgs
					),
					translateComponents
				);
		}

		return createInterpolateElement(
			sprintf(
				// translators: date is a formatted date, amount is a currency amount, and excludeTaxStringAbbreviation is something like "excludes VAT"
				__(
					'Renews at %(amount)s <abbr>%(excludeTaxStringAbbreviation)s</abbr> on <span>%(date)s</span>'
				),
				{
					amount: formatCurrency( purchase.price_integer, purchase.currency_code, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
					excludeTaxStringAbbreviation: excludeTaxStringAbbreviation,
					date: formatDate( new Date( purchase.renew_date ), locale, { dateStyle: 'long' } ),
				}
			),
			{
				abbr: <abbr title={ excludeTaxStringTitle } />,
				span: <span className="purchase-item__date" />,
			}
		);
	}

	if (
		isExpiring( purchase ) &&
		! isAkismetFreeProduct( purchase ) &&
		isWithinNext( new Date( purchase.expiry_date ), 30, 'days' ) &&
		! isRecentMonthlyPurchase( purchase )
	) {
		return (
			<span>
				{ createInterpolateElement(
					// translators: timeUntilExpiry is a formatted expiration string like "in 30 days" and date is a formatted expiry date
					sprintf( __( 'Expires %(timeUntilExpiry)s on <span>%(date)s</span>' ), {
						timeUntilExpiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
						date: formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
					} ),
					{ span: <span className="purchase-item__date" /> }
				) }
			</span>
		);
	}

	if ( isExpiring( purchase ) && ! isAkismetFreeProduct( purchase ) ) {
		return createInterpolateElement(
			// translators: %s is a formatted expiry date
			sprintf( __( 'Expires on <span>%s</span>' ), [
				formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
			] ),
			{
				span: <span className="purchase-item__date" />,
			}
		);
	}
	if ( isExpired( purchase ) && 'concierge-session' === purchase.product_slug ) {
		// translators: %s is a formatted expiry date
		return sprintf( __( 'Session used on %s' ), [
			formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
		] );
	}

	if ( isExpired( purchase ) ) {
		const isExpiredToday = isWithinLast( new Date( purchase.expiry_date ), 24, 'hours' );
		const expiredTodayText = __( 'Expired today' );
		// translators: timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"
		const expiredFromNowText = sprintf( __( 'Expired %(timeSinceExpiry)s' ), {
			timeSinceExpiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
		} );

		return (
			<span className="purchase-item__is-error">
				{ isExpiredToday ? expiredTodayText : expiredFromNowText }
			</span>
		);
	}

	if ( isIncludedWithPlan( purchase ) ) {
		return __( 'Included with Plan' );
	}

	if (
		( isOneTimePurchase( purchase ) || isAkismetFreeProduct( purchase ) ) &&
		purchase.product_slug !== 'domain_transfer'
	) {
		return __( 'Never Expires' );
	}

	return null;
}
