import { SubscriptionBillPeriod, getPlanNames } from '@automattic/api-core';
import { formatCurrency } from '@automattic/number-formatters';
import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useHelpCenter } from '../../app/help-center';
import { useLocale } from '../../app/locale';
import { Text } from '../../components/text';
import {
	formatDate,
	isWithinLast,
	isWithinNext,
	getRelativeTimeString,
} from '../../utils/datetime';
import {
	isA4ABillingDragonPurchase,
	isRecentMonthlyPurchase,
	isRenewingBeforeExpiration,
	isExpiring,
	isExpiredOrRemoved,
	isIncludedWithPlan,
	isOneTimePurchase,
	isAkismetFreeProduct,
	creditCardHasAlreadyExpired,
	creditCardExpiresBeforeSubscription,
	isCentennialPurchase,
} from '../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

// Renders a formatted purchase's expiry date in an inline-block span
// so that the text won't wrap by default.
function FormattedExpiryDate( { locale, purchase }: { locale: string; purchase: Purchase } ) {
	return (
		<span style={ { display: 'inline-block' } }>
			{ formatDate( new Date( purchase.expiry_date ), locale, {
				dateStyle: 'long',
			} ) }
		</span>
	);
}

export function PurchaseExpiryStatus( {
	purchase,
	isSiteMissing,
}: {
	purchase: Purchase;
	isSiteMissing?: boolean;
} ) {
	const locale = useLocale();
	const { setShowHelpCenter } = useHelpCenter();

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

	if ( purchase.partner_name && ! isA4ABillingDragonPurchase( purchase ) ) {
		// translators: partnerName is the name of the partner service who manages this product
		return sprintf( __( 'Managed by %(partnerName)s' ), {
			partnerName: purchase.partner_name,
		} );
	}

	if (
		isSiteMissing &&
		purchase.is_attached_to_holding_site &&
		purchase.product_type === 'jetpack'
	) {
		return (
			<>
				<span>{ __( 'Activate your product license key' ) }</span>
				<br />
				<ExternalLink href="https://jetpack.com/support/activate-a-jetpack-product-via-license-key/">
					{ __( 'Learn more' ) }
				</ExternalLink>
			</>
		);
	}

	const isA4ABDPurchase = isA4ABillingDragonPurchase( purchase );
	const temporarySitePurchaseProductTypes = [ 'saas_plugin', 'jetpack', 'akismet' ];
	const isKnownTemporarySiteProductType =
		purchase.is_attached_to_holding_site &&
		temporarySitePurchaseProductTypes.includes( purchase.product_type );
	const isJetpack = purchase.is_jetpack_plan_or_product;

	if ( isSiteMissing && ! isA4ABDPurchase && ! isKnownTemporarySiteProductType && isJetpack ) {
		return <span>{ __( 'Disconnected from WordPress.com' ) }</span>;
	}

	if (
		isSiteMissing &&
		! isA4ABDPurchase &&
		! isKnownTemporarySiteProductType &&
		! purchase.is_domain
	) {
		return (
			<span>
				{ createInterpolateElement(
					__( 'You no longer have access to this site and its purchases. <contactSupportLink/>' ),
					{
						contactSupportLink: (
							<Button
								variant="link"
								onClick={ () => {
									setShowHelpCenter( true );
								} }
							>
								{ __( 'Contact support' ) }
							</Button>
						),
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

	const isCentennial = isCentennialPurchase( purchase );

	if ( isCentennial ) {
		if ( isIncludedWithPlan( purchase ) ) {
			return __( 'Included with plan' );
		}
		return createInterpolateElement(
			// translators: date is a formatted expiry date
			__( 'Paid until <date />' ),
			{
				date: <FormattedExpiryDate locale={ locale } purchase={ purchase } />,
			}
		);
	}

	const isIntroductoryOfferFreeTrial = purchase.introductory_offer?.cost_per_interval === 0;
	if (
		purchase.introductory_offer?.is_within_period &&
		isIntroductoryOfferFreeTrial &&
		isRenewingBeforeExpiration( purchase )
	) {
		return createInterpolateElement(
			sprintf(
				// translators: %(date)s: a formatted date, %(amount)s: a currency amount, excludeTaxStringAbbreviation: something like "excludes VAT"
				__(
					'Free trial ends on %(date)s, renews automatically at %(amount)s <excludeTaxStringAbbreviation />'
				),
				{
					date: formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
					amount: formatCurrency( purchase.price_integer, purchase.currency_code, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
				}
			),
			{
				excludeTaxStringAbbreviation: (
					<abbr title={ excludeTaxStringTitle }>{ excludeTaxStringAbbreviation }</abbr>
				),
			}
		);
	}

	if (
		purchase.introductory_offer?.is_within_period &&
		isIntroductoryOfferFreeTrial &&
		! isExpiredOrRemoved( purchase )
	) {
		return (
			<span>
				{
					// translators: %(date)s: a formatted date
					sprintf( __( 'Free trial ends on %(date)s' ), {
						date: formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
					} )
				}
			</span>
		);
	}

	const isRenewingOnDate = Boolean( isRenewingBeforeExpiration( purchase ) && purchase.renew_date );
	if ( isRenewingOnDate && creditCardHasAlreadyExpired( purchase ) ) {
		return <span>{ __( 'Credit card expired' ) }</span>;
	}

	if ( isRenewingOnDate && creditCardExpiresBeforeSubscription( purchase ) ) {
		return (
			<span>
				{ sprintf(
					// translators: %(date)s: a formatted date
					__( 'Credit card expires before your next renewal on %(date)s' ),
					{
						date: formatDate( new Date( purchase.renew_date ), locale, { dateStyle: 'long' } ),
					}
				) }
			</span>
		);
	}

	// When a downgrade is scheduled for the next renewal, the plan won't simply
	// renew at its current price — it changes to a lower-tier plan. Say so instead
	// of the usual "Renews ... on <date>" line.
	if ( isRenewingOnDate && purchase.is_delayed_downgrade_pending ) {
		const slug = purchase.delayed_downgrade_to_product_slug;
		const planNames = getPlanNames() as Record< string, string | undefined >;
		const targetPlanName = slug ? planNames[ slug ] ?? null : null;
		const renewalDate = formatDate( new Date( purchase.renew_date ), locale, {
			dateStyle: 'long',
		} );
		if ( targetPlanName ) {
			return (
				<span>
					{ sprintf(
						// translators: %(plan)s is the plan being downgraded to (e.g. "Personal"); %(date)s is a formatted date
						__( 'Changing to %(plan)s on %(date)s' ),
						{ plan: targetPlanName, date: renewalDate }
					) }
				</span>
			);
		}
		return (
			<span>
				{ sprintf(
					// translators: %(date)s is a formatted date
					__( 'Changing plan on %(date)s' ),
					{ date: renewalDate }
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
			date: formatDate( new Date( purchase.renew_date ), locale, { dateStyle: 'long' } ),
		};
		const translateComponents = {
			excludeTaxStringAbbreviation: (
				<abbr title={ excludeTaxStringTitle }>{ excludeTaxStringAbbreviation }</abbr>
			),
		};
		switch ( purchase.bill_period_days ) {
			case SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD:
				return createInterpolateElement(
					sprintf(
						// translators: %(date)s: a formatted date, %(amount)s: a currency amount, excludeTaxStringAbbreviation: something like "excludes VAT"
						__( 'Renews monthly at %(amount)s <excludeTaxStringAbbreviation /> on %(date)s' ),
						translateArgs
					),
					translateComponents
				);
			case SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD:
				return createInterpolateElement(
					sprintf(
						// translators: %(date)s: a formatted date, %(amount)s: a currency amount, excludeTaxStringAbbreviation: something like "excludes VAT"
						__( 'Renews yearly at %(amount)s <excludeTaxStringAbbreviation /> on %(date)s' ),
						translateArgs
					),
					translateComponents
				);
			case SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD:
				return createInterpolateElement(
					sprintf(
						// translators: %(date)s: a formatted date, %(amount)s: a currency amount, excludeTaxStringAbbreviation: something like "excludes VAT"
						__(
							'Renews every two years at %(amount)s <excludeTaxStringAbbreviation /> on %(date)s'
						),
						translateArgs
					),
					translateComponents
				);
			case SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD:
				return createInterpolateElement(
					sprintf(
						// translators: %(date)s: a formatted date, %(amount)s: a currency amount, excludeTaxStringAbbreviation: something like "excludes VAT"
						__(
							'Renews every three years at %(amount)s <excludeTaxStringAbbreviation /> on %(date)s'
						),
						translateArgs
					),
					translateComponents
				);
			default:
				return createInterpolateElement(
					sprintf(
						// translators: %(date)s: a formatted date, %(amount)s: a currency amount, excludeTaxStringAbbreviation: something like "excludes VAT"
						__( 'Renews at %(amount)s <excludeTaxStringAbbreviation /> on %(date)s' ),
						translateArgs
					),
					translateComponents
				);
		}
	}

	if ( isExpiring( purchase ) && ! isAkismetFreeProduct( purchase ) ) {
		if (
			isWithinNext( new Date( purchase.expiry_date ), 30, 'days' ) &&
			! isRecentMonthlyPurchase( purchase )
		) {
			const intent = isWithinNext( new Date( purchase.expiry_date ), 7, 'days' )
				? ( 'error' as const )
				: ( 'warning' as const );

			return (
				<Text intent={ intent }>
					{ createInterpolateElement(
						sprintf(
							// translators: timeUntilExpiry is a formatted expiration string like "in 30 days" and date is a formatted expiry date
							__( 'Expires %(timeUntilExpiry)s on <date />' ),
							{
								timeUntilExpiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
							}
						),
						{
							date: <FormattedExpiryDate locale={ locale } purchase={ purchase } />,
						}
					) }
				</Text>
			);
		}

		return createInterpolateElement(
			// translators: date is a formatted expiry date
			__( 'Expires on <date />' ),
			{
				date: <FormattedExpiryDate locale={ locale } purchase={ purchase } />,
			}
		);
	}
	if ( isExpiredOrRemoved( purchase ) && 'concierge-session' === purchase.product_slug ) {
		// translators: %s is a formatted expiry date
		return sprintf( __( 'Session used on %s' ), [
			formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
		] );
	}

	if ( isExpiredOrRemoved( purchase ) ) {
		const isExpiredToday = isWithinLast( new Date( purchase.expiry_date ), 24, 'hours' );
		const expiredTodayText = __( 'Expired today' );
		// translators: timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"
		const expiredFromNowText = sprintf( __( 'Expired %(timeSinceExpiry)s' ), {
			timeSinceExpiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
		} );

		return <Text intent="error">{ isExpiredToday ? expiredTodayText : expiredFromNowText }</Text>;
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
