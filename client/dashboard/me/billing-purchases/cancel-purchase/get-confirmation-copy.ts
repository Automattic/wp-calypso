import { _n, __, sprintf } from '@wordpress/i18n';
import { intervalToDuration } from 'date-fns';
import {
	isAkismetProduct,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isMarketplacePlugin,
	isOneTimePurchase,
	isTitanMail,
	CancelIntent,
} from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

/**
 * Product-type buckets for confirmation-screen copy. Each bucket maps to a
 * distinct heading / notice / checkbox / fallback-loss phrasing.
 */
export type ProductCategory =
	| 'plan'
	| 'domain'
	| 'email'
	| 'jetpack'
	| 'akismet'
	| 'marketplace'
	| 'one-time'
	| 'other';

export function getProductCategory( purchase: Purchase ): ProductCategory {
	if ( isOneTimePurchase( purchase ) ) {
		return 'one-time';
	}
	if ( purchase.is_plan ) {
		return 'plan';
	}
	if ( purchase.is_domain_registration ) {
		return 'domain';
	}
	if ( isGSuiteOrGoogleWorkspaceProductSlug( purchase.product_slug ) || isTitanMail( purchase ) ) {
		return 'email';
	}
	if ( isAkismetProduct( purchase ) ) {
		return 'akismet';
	}
	if ( purchase.is_jetpack_plan_or_product ) {
		return 'jetpack';
	}
	if ( isMarketplacePlugin( purchase ) ) {
		return 'marketplace';
	}
	return 'other';
}

/**
 * "1 month and 11 days" / "14 days" / "2 years and 3 months" etc.
 * Returns an empty string when the expiry is today or in the past.
 * Months + days combo captures normal annual subscriptions; years + months
 * captures longer 100-year-style purchases without drowning the string in
 * unnecessary units.
 */
export function formatTimeRemaining( expiryDate: string | Date, from: Date = new Date() ): string {
	const end = typeof expiryDate === 'string' ? new Date( expiryDate ) : expiryDate;
	if ( ! ( end instanceof Date ) || isNaN( end.getTime() ) ) {
		return '';
	}
	if ( end.getTime() <= from.getTime() ) {
		return '';
	}

	const { years = 0, months = 0, days = 0 } = intervalToDuration( { start: from, end } );

	const parts: string[] = [];
	if ( years > 0 ) {
		parts.push(
			sprintf(
				/* translators: %d is a count of years */
				_n( '%d year', '%d years', years ),
				years
			)
		);
	}
	if ( months > 0 ) {
		parts.push(
			sprintf(
				/* translators: %d is a count of months */
				_n( '%d month', '%d months', months ),
				months
			)
		);
	}
	// Only include the days portion when we have fewer than a year. Past that,
	// "2 years and 3 months and 14 days" is noise.
	if ( days > 0 && years === 0 ) {
		parts.push(
			sprintf(
				/* translators: %d is a count of days */
				_n( '%d day', '%d days', days ),
				days
			)
		);
	}

	if ( parts.length === 0 ) {
		return '';
	}
	if ( parts.length === 1 ) {
		return parts[ 0 ];
	}
	if ( parts.length === 2 ) {
		return sprintf(
			/* translators: joins two duration parts, e.g. "1 month and 11 days" */
			__( '%1$s and %2$s' ),
			parts[ 0 ],
			parts[ 1 ]
		);
	}
	return sprintf(
		/* translators: joins three duration parts, e.g. "2 years, 3 months, and 14 days" */
		__( '%1$s, %2$s, and %3$s' ),
		parts[ 0 ],
		parts[ 1 ],
		parts[ 2 ]
	);
}

type ConfirmationCopyArgs = {
	purchase: Purchase;
	intent: CancelIntent;
};

/**
 * Screen heading.
 * - Cancel intent → always "Cancel subscription" to match the button copy.
 * - Remove intent → product-type-aware ("Remove plan", "Remove domain",
 *   "Remove {productName}" for individual products).
 */
export function getCancellationHeading( { purchase, intent }: ConfirmationCopyArgs ): string {
	if ( intent === 'cancel' ) {
		return __( 'Cancel subscription' );
	}
	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return __( 'Remove plan' );
		case 'domain':
			return __( 'Remove domain' );
		case 'email':
			return __( 'Remove email' );
		case 'jetpack':
		case 'akismet':
		case 'marketplace':
		case 'one-time':
			return sprintf(
				/* translators: %(productName)s is the product name, e.g. "Remove Jetpack Search" */
				__( 'Remove %(productName)s' ),
				{ productName: purchase.product_name }
			);
		default:
			return __( 'Remove subscription' );
	}
}

/**
 * Top-of-screen notice for the Cancel variant. Returns null for Remove, for
 * one-time purchases, and when we can't compute a duration (e.g. partner-
 * managed or already-expired purchases).
 */
export function getTopNoticeCopy( { purchase, intent }: ConfirmationCopyArgs ): string | null {
	if ( intent !== 'cancel' ) {
		return null;
	}
	if ( ! purchase.expiry_date ) {
		return null;
	}
	const duration = formatTimeRemaining( purchase.expiry_date );
	if ( ! duration ) {
		return null;
	}

	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return sprintf(
				/* translators: %(duration)s is a human-readable duration, e.g. "1 month and 11 days" */
				__(
					'Your plan features will be available for another %(duration)s after you cancel your subscription.'
				),
				{ duration }
			);
		case 'domain':
			return sprintf(
				/* translators: %(duration)s is a human-readable duration, e.g. "1 month and 11 days" */
				__( 'Your domain will remain active for another %(duration)s after you cancel.' ),
				{ duration }
			);
		case 'email':
			return sprintf(
				/* translators: %(duration)s is a human-readable duration, e.g. "1 month and 11 days" */
				__( 'Your email will remain active for another %(duration)s after you cancel.' ),
				{ duration }
			);
		case 'one-time':
			return null;
		default:
			return sprintf(
				/* translators: %(productName)s is the product name; %(duration)s is a human-readable duration */
				__(
					'%(productName)s will remain active for another %(duration)s after you cancel your subscription.'
				),
				{ productName: purchase.product_name, duration }
			);
	}
}

/**
 * Intro for the losses list on the Cancel variant.
 * Full form: "When you cancel your subscription, {subject} will expire on
 * {date} and you'll lose access to:"
 *
 * {subject} follows the same product-category rules as the Remove intro:
 * "your plan features" / "your domain" / "your email" / "Jetpack Search"
 * (product name for individual products) / "your subscription" (fallback).
 */
export function getCancelLossIntro( purchase: Purchase, fullExpiryDate: string ): string {
	const category = getProductCategory( purchase );
	if ( ! fullExpiryDate ) {
		// No meaningful expiry: fall back to a simpler intro without the date.
		return __( 'You’ll lose access to:' );
	}
	switch ( category ) {
		case 'plan':
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date, e.g. "April 16, 2027" */
				__(
					'When you cancel your subscription, your plan features will expire on %(date)s and you’ll lose access to:'
				),
				{ date: fullExpiryDate }
			);
		case 'domain':
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date */
				__(
					'When you cancel your subscription, your domain will expire on %(date)s and you’ll lose access to:'
				),
				{ date: fullExpiryDate }
			);
		case 'email':
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date */
				__(
					'When you cancel your subscription, your email will expire on %(date)s and you’ll lose access to:'
				),
				{ date: fullExpiryDate }
			);
		case 'jetpack':
		case 'akismet':
		case 'marketplace':
		case 'one-time':
			return sprintf(
				/* translators: %(productName)s is the product name; %(date)s is the expiry date */
				__(
					'When you cancel your subscription, %(productName)s will expire on %(date)s and you’ll lose access to:'
				),
				{ productName: purchase.product_name, date: fullExpiryDate }
			);
		default:
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date */
				__(
					'When you cancel your subscription, it will expire on %(date)s and you’ll lose access to:'
				),
				{ date: fullExpiryDate }
			);
	}
}

/**
 * Intro for the losses list on the Remove variant.
 * Uses the product-type category noun or the product name (same rules as the
 * heading), so users see "When you remove your plan…" vs. "When you remove
 * your domain…" vs. "When you remove Jetpack Search…".
 */
export function getRemoveLossIntro( purchase: Purchase ): string {
	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return __( 'When you remove your plan, you’ll lose access to:' );
		case 'domain':
			return __( 'When you remove your domain, you’ll lose access to:' );
		case 'email':
			return __( 'When you remove your email, you’ll lose access to:' );
		case 'jetpack':
		case 'akismet':
		case 'marketplace':
		case 'one-time':
			return sprintf(
				/* translators: %(productName)s is the product name, e.g. "When you remove Jetpack Search, you'll lose access to:" */
				__( 'When you remove %(productName)s, you’ll lose access to:' ),
				{ productName: purchase.product_name }
			);
		default:
			return __( 'When you remove your subscription, you’ll lose access to:' );
	}
}

/**
 * Two-sentence copy for the confirmed refund notice on the Remove screen.
 * Product-type-aware: "remove your plan" / "remove your domain" / "remove
 * Jetpack Search", and "Your plan features will be removed" / "Your domain
 * will be removed" / "Jetpack Search will be removed".
 */
export function getRefundNoticeCopy( {
	purchase,
	refundAmount,
}: {
	purchase: Purchase;
	refundAmount: string;
} ): string {
	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount */
				__(
					'You’ll receive a %(refundAmount)s refund when you remove your plan. Your plan features will be removed right away.'
				),
				{ refundAmount }
			);
		case 'domain':
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount */
				__(
					'You’ll receive a %(refundAmount)s refund when you remove your domain. Your domain will be removed right away.'
				),
				{ refundAmount }
			);
		case 'email':
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount */
				__(
					'You’ll receive a %(refundAmount)s refund when you remove your email. Your email will be removed right away.'
				),
				{ refundAmount }
			);
		case 'jetpack':
		case 'akismet':
		case 'marketplace':
		case 'one-time':
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount; %(productName)s is the product name */
				__(
					'You’ll receive a %(refundAmount)s refund when you remove %(productName)s. %(productName)s will be removed right away.'
				),
				{ refundAmount, productName: purchase.product_name }
			);
		default:
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount */
				__(
					'You’ll receive a %(refundAmount)s refund when you remove your subscription. Your subscription will be removed right away.'
				),
				{ refundAmount }
			);
	}
}

/**
 * Universal confirm checkbox — same on Cancel and Remove, any product type.
 * Expiry date lives in the feature-list intro and the top notice; the
 * checkbox is a final "I read the above" ack.
 */
export function getCheckboxLabel(): string {
	return __( 'I’ve reviewed what I’ll lose and want to proceed.' );
}

/**
 * Primary and secondary button labels.
 */
export function getButtonLabels( { purchase, intent }: ConfirmationCopyArgs ): {
	primary: string;
	secondary: string;
} {
	const category = getProductCategory( purchase );
	if ( intent === 'remove' ) {
		switch ( category ) {
			case 'plan':
				return { primary: __( 'Remove plan' ), secondary: __( 'Keep plan' ) };
			case 'domain':
				return { primary: __( 'Remove domain' ), secondary: __( 'Keep domain' ) };
			case 'email':
				return { primary: __( 'Remove email' ), secondary: __( 'Keep email' ) };
			default:
				return {
					primary: __( 'Remove subscription' ),
					secondary: __( 'Keep subscription' ),
				};
		}
	}
	// Cancel intent: always "Cancel subscription" / "Keep subscription" to match
	// the heading and Purchase Settings button.
	return {
		primary: __( 'Cancel subscription' ),
		secondary: __( 'Keep subscription' ),
	};
}

/**
 * One-item fallback losses list for products without a server-provided
 * cancellation features list.
 */
export function getFallbackLossItems( purchase: Purchase ): string[] {
	const category = getProductCategory( purchase );
	const productName = purchase.product_name;
	switch ( category ) {
		case 'plan':
			return [
				sprintf(
					/* translators: %(productName)s is the plan name */
					__( 'All %(productName)s features' ),
					{ productName }
				),
			];
		case 'domain':
			return [
				sprintf(
					/* translators: %(domainName)s is a domain name */
					__( 'Your domain at %(domainName)s' ),
					{ domainName: purchase.meta ?? purchase.domain }
				),
			];
		case 'email':
			if ( isGSuiteOrGoogleWorkspaceProductSlug( purchase.product_slug ) ) {
				return [ __( 'Your Google Workspace accounts' ) ];
			}
			return [ __( 'Your professional email accounts' ) ];
		case 'jetpack':
			return [
				sprintf(
					/* translators: %(productName)s is the Jetpack product name */
					__( '%(productName)s protection' ),
					{ productName }
				),
			];
		case 'akismet':
			return [ __( 'Akismet spam protection' ) ];
		case 'marketplace':
			return [
				sprintf(
					/* translators: %(productName)s is the plugin or extension name */
					__( '%(productName)s and its data' ),
					{ productName }
				),
			];
		case 'one-time':
			return [ productName ];
		default:
			return [
				sprintf(
					/* translators: %(productName)s is the product name */
					__( 'Your %(productName)s subscription' ),
					{ productName }
				),
			];
	}
}
