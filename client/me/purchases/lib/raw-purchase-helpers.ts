import { isPurchaseOneTimePurchase, PRODUCT_STUDIO_CODE_AI_CREDITS } from '@automattic/api-core';
import {
	findPlansKeys,
	getAkismetPro500ProductDisplayName,
	getJetpackProductsDisplayNames,
	getPlan,
	getProductFromSlug,
	getStorageAddOnDisplayName,
	is100Year,
	isAkismetPro500,
	isAkismetProduct,
	isConciergeSession,
	isDomainMapping,
	isDomainRegistration,
	isGSuiteOrGoogleWorkspace,
	isJetpackAISlug,
	isJetpackStatsPaidProductSlug,
	isMonthly as isMonthlyPlan,
	isMonthlyProduct,
	isTieredVolumeSpaceAddon,
	isTitanMail,
	TYPE_PERSONAL,
} from '@automattic/calypso-products';
import { formatNumber } from '@automattic/number-formatters';
import i18n from 'i18n-calypso';
import moment from 'moment';
import {
	isA4AHoldingSitePurchase,
	isAgencyPartnerType,
	isMarketplaceHoldingSitePurchase,
	isPartnerPurchase,
} from 'calypso/dashboard/utils/purchase';
import { getStudioCodeAiCreditsTitle } from 'calypso/dashboard/utils/studio-code-ai-credits';
import { addPaymentMethod, changePaymentMethod } from '../paths';
import type { MarketingSurveyResponses, Purchase } from '@automattic/api-core';
import type { TranslateResult } from 'i18n-calypso';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

/**
 * Purchase helpers for the classic Calypso surfaces that still act on
 * purchases (marketing-survey cancellation dialogs, domain and plan management,
 * checkout). These read the snake_case `Purchase` from `@automattic/api-core`
 * directly.
 *
 * This module is intentionally local and not exported from any shared package:
 * several of these helpers have historically misleading names and should not be
 * reached for by new code. Prefer `@automattic/api-core` transforms or reading
 * raw fields directly where possible.
 */

export function getName( purchase: Purchase ): string {
	if ( isDomainRegistration( purchase ) || isDomainMapping( purchase ) ) {
		return purchase.meta ?? '';
	}
	return purchase.product_name;
}

export function enrichedSurveyData(
	surveyData: Omit< MarketingSurveyResponses, 'purchaseId' | 'purchase' >,
	purchase?: Pick< Purchase, 'subscribed_date' | 'blog_created_date' | 'ID' | 'product_slug' >,
	timestamp = new Date()
): MarketingSurveyResponses {
	const purchaseStartDate = purchase?.subscribed_date;
	const siteStartDate = purchase?.blog_created_date;
	const purchaseId = purchase?.ID ?? 0;
	const productSlug = purchase?.product_slug ?? '';

	return {
		purchase: productSlug,
		purchaseId,
		...( purchaseStartDate && {
			daysSincePurchase:
				( new Date( timestamp ).getTime() - new Date( purchaseStartDate ).getTime() ) / DAY_IN_MS,
		} ),
		...( siteStartDate && {
			daysSinceSiteCreation:
				( new Date( timestamp ).getTime() - new Date( siteStartDate ).getTime() ) / DAY_IN_MS,
		} ),
		...surveyData,
	};
}

function isIncludedWithPlan( purchase: Purchase ): boolean {
	return purchase.expiry_status === 'included';
}

export function isSubscription( purchase: Purchase ): boolean {
	return ! isDomainRegistration( purchase ) && ! isPurchaseOneTimePurchase( purchase );
}

export function isExpiredAndInGracePeriod( purchase: Purchase ): boolean {
	return purchase.expiry_status === 'expired' && purchase.subscription_status === 'active';
}

export function isRemoved( purchase: Purchase ): boolean {
	return purchase.subscription_status !== 'active';
}

export function isExpiredOrRemoved( purchase: Purchase ): boolean {
	return isExpiredAndInGracePeriod( purchase ) || isRemoved( purchase );
}

export function isRenewingBeforeExpiration( purchase: Purchase ): boolean {
	return [ 'active', 'auto-renewing' ].includes( purchase.expiry_status );
}

export function isExpiring( purchase: Purchase ): boolean {
	return [ 'manual-renew', 'expiring' ].includes( purchase.expiry_status );
}

export function isExpiredWithNoAutoRenewAttemptsLeft( purchase: Purchase ): boolean {
	return isExpiredAndInGracePeriod( purchase ) && purchase.is_past_last_auto_renew_attempt_date;
}

function isMonthlyPurchase( purchase: Purchase ): boolean {
	const plan = getPlan( purchase.product_slug );
	if ( plan ) {
		return isMonthlyPlan( purchase.product_slug );
	}

	// Note that getProductFromSlug() returns a string when given a non-product
	// slug, so we need to check that it's an object before using it.
	const product = getProductFromSlug( purchase.product_slug );
	if ( product && typeof product !== 'string' ) {
		return isMonthlyProduct( product );
	}

	return false;
}

export function isCloseToExpiration( purchase: Purchase ): boolean {
	if ( ! purchase.expiry_date ) {
		return false;
	}

	const expiryThresholdInMonths = isMonthlyPurchase( purchase ) ? 1 : 3;
	return moment( purchase.expiry_date ).diff( Date.now(), 'months' ) < expiryThresholdInMonths;
}

export function isRechargeable( purchase: Purchase ): boolean {
	return purchase.is_rechargeable;
}

export function isRenewable( purchase: Purchase ): boolean {
	return purchase.is_renewable;
}

function isPaidWithCreditCard( purchase: Purchase ): boolean {
	return purchase.payment_type === 'credit_card' && Boolean( purchase.payment_expiry );
}

export function getChangePaymentMethodPath( siteSlug: string, purchase: Purchase ): string {
	if ( isPaidWithCreditCard( purchase ) ) {
		return changePaymentMethod( siteSlug, purchase.ID, Number( purchase.payment_card_id ) );
	}

	return addPaymentMethod( siteSlug, purchase.ID );
}

export function needsToRenewSoon( purchase: Purchase ): boolean {
	if (
		isPurchaseOneTimePurchase( purchase ) ||
		isPartnerPurchase( purchase ) ||
		! isRenewable( purchase ) ||
		! purchase.can_explicit_renew
	) {
		return false;
	}

	const isPastExpiry = new Date( purchase.expiry_date ) < new Date();
	return isCloseToExpiration( purchase ) || isPastExpiry;
}

export function shouldAddPaymentSourceInsteadOfRenewingNow( purchase: Purchase ): boolean {
	if ( ! purchase || ! purchase.expiry_date ) {
		return false;
	}
	return moment( purchase.expiry_date ) > moment().add( 3, 'months' );
}

export function monthsUntilCardExpires( purchase: Purchase ): number {
	if ( purchase.payment_expiry_date ) {
		return moment( purchase.payment_expiry_date ).diff( moment(), 'months' );
	}
	const cardExpiry = purchase.payment_type === 'credit_card' ? purchase.payment_expiry : undefined;
	return moment( cardExpiry, 'MM/YY' ).diff( moment(), 'months' );
}

function creditCardExpiresBeforeSubscription( purchase: Purchase ): boolean {
	if (
		! isPaidWithCreditCard( purchase ) ||
		( is100Year( purchase ) && ! isCloseToExpiration( purchase ) )
	) {
		return false;
	}

	if ( purchase.payment_expiry_date ) {
		return moment( purchase.payment_expiry_date ).isBefore( purchase.expiry_date, 'day' );
	}

	return moment( purchase.payment_expiry, 'MM/YY' ).isBefore( purchase.expiry_date, 'months' );
}

export function shouldRenderExpiringCreditCard( purchase: Purchase ): boolean {
	return (
		! isExpiredOrRemoved( purchase ) &&
		! isExpiring( purchase ) &&
		! isPurchaseOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		creditCardExpiresBeforeSubscription( purchase )
	);
}

export function getDowngradePlanFromPurchase( purchase: Purchase ) {
	const plan = getPlan( purchase.product_slug );
	if ( ! plan ) {
		return null;
	}

	const newPlanKeys = findPlansKeys( {
		group: plan.group,
		type: TYPE_PERSONAL,
		term: plan.term,
	} );

	return getPlan( newPlanKeys[ 0 ] );
}

export function getDisplayName( purchase: Purchase ): TranslateResult {
	const jetpackProductsDisplayNames = getJetpackProductsDisplayNames( 'full' );
	const productName = purchase.product_name;
	const productSlug = purchase.product_slug;
	const quantity = purchase.renewal_price_tier_usage_quantity;
	const priceTierList = purchase.price_tier_list;

	if ( isJetpackAISlug( productSlug ) && quantity && priceTierList?.length ) {
		return i18n.translate( '%(productName)s (%(quantity)s requests per month)', {
			args: {
				productName: jetpackProductsDisplayNames[ productSlug ],
				quantity: formatNumber( quantity ),
			},
		} );
	}

	if ( isJetpackStatsPaidProductSlug( productSlug ) && quantity && priceTierList?.length ) {
		return i18n.translate( '%(productName)s (%(quantity)s views per month)', {
			args: {
				productName: jetpackProductsDisplayNames[ productSlug ],
				quantity: formatNumber( quantity ),
			},
		} );
	}

	if ( jetpackProductsDisplayNames[ productSlug ] ) {
		return jetpackProductsDisplayNames[ productSlug ];
	}

	if ( PRODUCT_STUDIO_CODE_AI_CREDITS === productSlug && quantity ) {
		return getStudioCodeAiCreditsTitle( productName, quantity );
	}

	if ( isTieredVolumeSpaceAddon( purchase ) ) {
		return getStorageAddOnDisplayName( productName, quantity ?? null );
	}

	if ( isAkismetPro500( purchase ) ) {
		return getAkismetPro500ProductDisplayName( productName, quantity ?? null );
	}

	if ( purchase.is_plan && productName ) {
		return i18n.translate( '%(productName)s Plan', {
			args: {
				productName: productName.replace( /\s*\(.*$/, '' ).trim(),
			},
		} );
	}

	return getName( purchase );
}

export function purchaseType( purchase: Purchase ): string | null {
	if ( purchase.product_type === 'theme' ) {
		return i18n.translate( 'Premium Theme' );
	}

	if ( isConciergeSession( purchase ) ) {
		return i18n.translate( 'One-on-one Support' );
	}

	if ( isPartnerPurchase( purchase ) ) {
		if ( isAgencyPartnerType( purchase.partner_type ?? '' ) ) {
			return i18n.translate( 'Agency Managed Plan' );
		}

		return i18n.translate( 'Host Managed Plan' );
	}

	if ( purchase.is_plan ) {
		return null;
	}

	if ( isDomainRegistration( purchase ) ) {
		return purchase.product_name;
	}

	if ( isDomainMapping( purchase ) ) {
		return purchase.product_name;
	}

	if ( isAkismetProduct( purchase ) ) {
		return null;
	}

	if ( isMarketplaceHoldingSitePurchase( purchase ) ) {
		return null;
	}

	if ( isA4AHoldingSitePurchase( purchase ) ) {
		return null;
	}

	if ( isGSuiteOrGoogleWorkspace( purchase ) ) {
		return i18n.translate( 'Mailboxes and Productivity Tools at %(domain)s', {
			textOnly: true,
			args: {
				domain: purchase.meta as string,
			},
		} );
	}

	if ( isTitanMail( purchase ) ) {
		return i18n.translate( 'Mailboxes at %(domain)s', {
			textOnly: true,
			args: {
				domain: purchase.meta as string,
			},
		} );
	}

	if ( purchase.product_type === 'marketplace_plugin' || purchase.product_type === 'saas_plugin' ) {
		return i18n.translate( 'Plugin' );
	}

	if ( purchase.meta ) {
		return purchase.meta;
	}

	return null;
}
