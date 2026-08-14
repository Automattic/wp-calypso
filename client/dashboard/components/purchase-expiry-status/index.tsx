import './style.scss';

import { SubscriptionBillPeriod, getPlanNames } from '@automattic/api-core';
import { formatCurrency } from '@automattic/number-formatters';
import { Button, ExternalLink, Icon } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { arrowUpRight } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { useHelpCenter } from '../../app/help-center';
import { useLocale } from '../../app/locale';
import { Text } from '../../components/text';
import { formatDate, getCalendarDaysUntil, getRelativeDayString } from '../../utils/datetime';
import {
	EXPIRY_ERROR_DAYS,
	EXPIRY_WARNING_DAYS,
	isA4ABillingDragonPurchase,
	isRenewingBeforeExpiration,
	isExpiring,
	isExpiredOrRemoved,
	isIncludedWithPlan,
	isOneTimePurchase,
	isAkismetFreeProduct,
	creditCardHasAlreadyExpired,
	creditCardExpiresBeforeSubscription,
	isCentennialPurchase,
	getRenewalUrlFromPurchase,
} from '../../utils/purchase';
import {
	getExpiredCopy,
	getExpiredRenewalTitle,
	getExpiringSoonCopy,
	getExpiringSoonRenewalTitle,
} from '../../utils/purchase-expiry-copy';
import type { ExpiryStatusCopy } from '../../utils/purchase-expiry-copy';
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

/**
 * The expiry status of a subscription that is close to expiring or has already
 * expired: colored to draw attention, and linked to renewal checkout where
 * renewing is something the viewer can act on right now.
 *
 * Expiry further off than the warning window is not urgent, and is rendered as
 * plain text by the caller rather than through here.
 */
function UrgentExpiryStatus( {
	purchase,
	copy,
	hasExpired,
	untranslatedFallbackText,
}: {
	purchase: Purchase;
	copy: ExpiryStatusCopy;

	/**
	 * Whether `copy` describes a lapsed subscription rather than one still
	 * heading for expiry. Taken from the caller because that is decided by the
	 * subscription's status, which can disagree with its date in both
	 * directions — and the tooltip has to read the same way the status does.
	 */
	hasExpired: boolean;

	/**
	 * Wording for locales that have no translation for `copy` yet. A `ReactNode`
	 * because that older sentence interpolates the date into an element. Both
	 * this and `copy.text`'s nullability go away once the copy is translated.
	 */
	untranslatedFallbackText?: React.ReactNode;
} ) {
	const locale = useLocale();
	const { user } = useAuth();
	const { recordTracksEvent } = useAnalytics();

	// The wording drops the expiry date to keep the column short, so it moves to
	// a tooltip rather than disappearing.
	const daysUntilExpiry = getCalendarDaysUntil( new Date( purchase.expiry_date ) );
	const expiryDateTitle = formatDate( new Date( purchase.expiry_date ), locale, {
		dateStyle: 'long',
	} );

	// The purchase page gates its "Renew now" action on these same two
	// conditions. Calypso's equivalent surfaces apply a longer list; the two
	// clients are knowingly out of step here.
	const canRenew = purchase.can_explicit_renew && String( user.ID ) === String( purchase.user_id );

	// How close to expiry a subscription has to be before renewal is worth
	// offering. A monthly subscription is never far from expiring, so the annual
	// window would ask for a renewal within days of the purchase; it gets the
	// last week instead. Anything already past its expiry date is inside either.
	const renewalWindowDays =
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD
			? EXPIRY_ERROR_DAYS
			: EXPIRY_WARNING_DAYS;
	const isRenewalWorthOffering = canRenew && daysUntilExpiry <= renewalWindowDays;

	const expiryText = copy.text ?? untranslatedFallbackText;

	if ( ! isRenewalWorthOffering ) {
		return (
			<Text intent={ copy.intent } title={ expiryDateTitle }>
				{ expiryText }
			</Text>
		);
	}

	const renewalTitle = hasExpired
		? getExpiredRenewalTitle( expiryDateTitle )
		: getExpiringSoonRenewalTitle( expiryDateTitle );

	return (
		<Text intent={ copy.intent }>
			<a
				className="purchase-expiry-status__renew-link"
				// On the link rather than the wrapper, so that it describes the link
				// to a screen reader as well as showing on hover.
				title={ renewalTitle ?? expiryDateTitle }
				href={ getRenewalUrlFromPurchase( purchase ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_purchases_renew_now_click', {
						product_slug: purchase.product_slug,
						position: 'purchase-list',
					} )
				}
			>
				{ expiryText }
				<Icon icon={ arrowUpRight } size={ 18 } />
			</a>
		</Text>
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
						date: formatDate( new Date( purchase.renew_date ?? '' ), locale, {
							dateStyle: 'long',
						} ),
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
		const renewalDate = formatDate( new Date( purchase.renew_date ?? '' ), locale, {
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
			date: formatDate( new Date( purchase.renew_date ?? '' ), locale, { dateStyle: 'long' } ),
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
		const copy = getExpiringSoonCopy( new Date( purchase.expiry_date ) );

		if ( ! copy ) {
			return createInterpolateElement(
				// translators: date is a formatted expiry date
				__( 'Expires on <date />' ),
				{
					date: <FormattedExpiryDate locale={ locale } purchase={ purchase } />,
				}
			);
		}

		// Only reached where the day-count copy has no translation yet. Delete
		// this and the prop it is passed to once it does; see `getExpiringSoonCopy`.
		const untranslatedFallbackText = createInterpolateElement(
			sprintf(
				// translators: timeUntilExpiry is a formatted expiration string like "in 30 days" and date is a formatted expiry date
				__( 'Expires %(timeUntilExpiry)s on <date />' ),
				{
					timeUntilExpiry: getRelativeDayString( new Date( purchase.expiry_date ), 'upcoming' ),
				}
			),
			{
				date: <FormattedExpiryDate locale={ locale } purchase={ purchase } />,
			}
		);

		return (
			<UrgentExpiryStatus
				purchase={ purchase }
				copy={ copy }
				hasExpired={ false }
				untranslatedFallbackText={ untranslatedFallbackText }
			/>
		);
	}
	if ( isExpiredOrRemoved( purchase ) && 'concierge-session' === purchase.product_slug ) {
		// translators: %s is a formatted expiry date
		return sprintf( __( 'Session used on %s' ), [
			formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
		] );
	}

	if ( isExpiredOrRemoved( purchase ) ) {
		return (
			<UrgentExpiryStatus
				purchase={ purchase }
				copy={ getExpiredCopy( new Date( purchase.expiry_date ) ) }
				hasExpired
			/>
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
