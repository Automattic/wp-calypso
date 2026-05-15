import { AkismetPlans, TitanMailSlugs } from '@automattic/api-core';
import { _n, __, sprintf } from '@wordpress/i18n';
import { intervalToDuration } from 'date-fns';
import { isGSuiteOrGoogleWorkspaceProductSlug, DisplayVariant } from '../../../utils/purchase';

/**
 * Minimal purchase shape the confirmation copy depends on. Both surfaces
 * (dashboard `Purchase` from `@automattic/api-core`; legacy `Purchases.Purchase`
 * from `@automattic/data-stores`) adapt to this shape so the copy helper
 * itself is surface-agnostic. The dashboard Purchase is structurally
 * assignable; the legacy side uses the adapter in
 * `client/me/purchases/cancel-purchase/to-purchase-for-copy.ts`.
 */
export type PurchaseForCopy = {
	is_plan: boolean;
	is_domain_registration: boolean;
	is_jetpack_plan_or_product: boolean;
	product_slug: string;
	product_name: string;
	product_type: string;
	expiry_date: string;
	// Only the 'one-time-purchase' sentinel is inspected; anything else falls
	// through to the non-one-time branches.
	expiry_status: string;
	meta?: string;
	domain: string;
};

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

function isTitanMailSlug( productSlug: string ): boolean {
	return (
		productSlug === TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG ||
		productSlug === TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG
	);
}

function isAkismetProductSlug( productSlug: string ): boolean {
	return ( Object.values( AkismetPlans ) as readonly string[] ).includes( productSlug );
}

function isMarketplacePluginProductType( productType: string ): boolean {
	return productType.startsWith( 'marketplace' ) || productType === 'saas_plugin';
}

export function getProductCategory( purchase: PurchaseForCopy ): ProductCategory {
	if ( purchase.expiry_status === 'one-time-purchase' ) {
		return 'one-time';
	}
	if ( purchase.is_plan ) {
		return 'plan';
	}
	if ( purchase.is_domain_registration ) {
		return 'domain';
	}
	if (
		isGSuiteOrGoogleWorkspaceProductSlug( purchase.product_slug ) ||
		isTitanMailSlug( purchase.product_slug )
	) {
		return 'email';
	}
	if ( isAkismetProductSlug( purchase.product_slug ) ) {
		return 'akismet';
	}
	if ( purchase.is_jetpack_plan_or_product ) {
		return 'jetpack';
	}
	if ( isMarketplacePluginProductType( purchase.product_type ) ) {
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
	purchase: PurchaseForCopy;
	intent: DisplayVariant;
};

/**
 * Screen heading.
 * - Cancel intent → always "Cancel subscription" to match the button copy.
 * - Remove intent → product-type-aware ("Remove plan", "Remove domain",
 *   "Remove {productName}" for individual products).
 */
export function getCancellationHeading( { purchase, intent }: ConfirmationCopyArgs ): string {
	if ( intent === 'auto-renew' ) {
		return __( 'Turn off auto-renew' );
	}
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
		case 'marketplace':
			if ( purchase.product_type === 'marketplace_theme' ) {
				return __( 'Remove theme' );
			}
			return __( 'Remove plugin' );
		case 'jetpack':
		case 'akismet':
		case 'one-time':
			return sprintf(
				/* translators: %(productName)s is the product name, e.g. "Remove Jetpack Search" */
				__( 'Remove %(productName)s' ),
				{ productName: purchase.product_name }
			);
		default:
			return __( 'Remove upgrade' );
	}
}

/**
 * Top-of-screen notice for the Cancel variant. Returns null for Remove, for
 * one-time purchases, and when we can't compute a duration (e.g. partner-
 * managed or already-expired purchases).
 */
export function getTopNoticeCopy( { purchase, intent }: ConfirmationCopyArgs ): string | null {
	if ( intent !== 'cancel' && intent !== 'auto-renew' ) {
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
				__( 'Your plan features will be available for another %(duration)s.' ),
				{ duration }
			);
		case 'domain':
			return sprintf(
				/* translators: %(duration)s is a human-readable duration, e.g. "1 month and 11 days" */
				__( 'Your domain will remain active for another %(duration)s.' ),
				{ duration }
			);
		case 'email':
			return sprintf(
				/* translators: %(duration)s is a human-readable duration, e.g. "1 month and 11 days" */
				__( 'Your email will remain active for another %(duration)s.' ),
				{ duration }
			);
		case 'one-time':
			return null;
		default:
			return sprintf(
				/* translators: %(productName)s is the product name; %(duration)s is a human-readable duration */
				__( '%(productName)s will remain active for another %(duration)s.' ),
				{ productName: purchase.product_name, duration }
			);
	}
}

/**
 * Intro for the losses list on the Cancel variant.
 * Form: "Your {category} will expire on {date} and you’ll lose access to:"
 * Falls back to a date-less form when no expiry is available.
 */
export function getCancelLossIntro( purchase: PurchaseForCopy, fullExpiryDate: string ): string {
	const category = getProductCategory( purchase );
	if ( ! fullExpiryDate ) {
		return __( 'You’ll lose access to:' );
	}
	switch ( category ) {
		case 'plan':
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date, e.g. "April 16, 2027" */
				__( 'On %(date)s, your plan will expire. Here’s what you’ll lose:' ),
				{ date: fullExpiryDate }
			);
		case 'domain':
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date, e.g. "April 16, 2027" */
				__( 'On %(date)s, your domain will expire. Here’s what you’ll lose:' ),
				{ date: fullExpiryDate }
			);
		case 'email':
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date, e.g. "April 16, 2027" */
				__( 'On %(date)s, your email will expire. Here’s what you’ll lose:' ),
				{ date: fullExpiryDate }
			);
		default:
			return sprintf(
				/* translators: %(date)s is the full expiry date; %(productName)s is the product name */
				__(
					'On %(date)s, your %(productName)s subscription will expire. Here’s what you’ll lose:'
				),
				{ date: fullExpiryDate, productName: purchase.product_name }
			);
	}
}

/**
 * Intro for the losses list on the Remove variant. Frames the list as the set
 * of things being removed right now (vs. the Cancel variant, which frames it
 * as a future loss).
 */
export function getRemoveLossIntro( purchase: PurchaseForCopy ): string {
	const category = getProductCategory( purchase );
	const productName = purchase.product_name;
	switch ( category ) {
		case 'plan':
			return sprintf(
				/* translators: %(productName)s is the plan name, e.g. "WordPress.com Business plan" */
				__( "Your %(productName)s plan will be removed immediately. Here's what you'll lose:" ),
				{ productName }
			);
		case 'domain':
			return sprintf(
				/* translators: %(domainName)s is a domain name, e.g. "example.com" */
				__( "%(domainName)s will be removed immediately. Here's what you'll lose:" ),
				{ domainName: purchase.meta ?? purchase.domain }
			);
		default:
			return sprintf(
				/* translators: %(productName)s is the product name, e.g. "Jetpack Search", "G Suite" */
				__( "%(productName)s will be removed immediately. Here's what you'll lose:" ),
				{ productName }
			);
	}
}

/**
 * Single-sentence copy for the Cancel variant when there is exactly one loss
 * item. Replaces the intro + bullet list so the screen doesn't just restate
 * the heading. Uses the expiry date when available; falls back to a date-less
 * form for partner-managed or already-expired purchases.
 */
export function getSingleItemCancelCopy(
	purchase: PurchaseForCopy,
	fullExpiryDate: string
): string {
	const category = getProductCategory( purchase );
	if ( ! fullExpiryDate ) {
		switch ( category ) {
			case 'plan':
				return __(
					"Your plan subscription will expire. After that, it will be deactivated and you'll no longer be able to use it."
				);
			case 'domain':
				return __(
					"Your domain subscription will expire. After that, it will be deactivated and you'll no longer be able to use it."
				);
			case 'email':
				return __(
					"Your email subscription will expire. After that, it will be deactivated and you'll no longer be able to use it."
				);
			default:
				return sprintf(
					/* translators: %(productName)s is the product name */
					__(
						"Your %(productName)s subscription will expire. After that, it will be deactivated and you'll no longer be able to use it."
					),
					{ productName: purchase.product_name }
				);
		}
	}
	switch ( category ) {
		case 'plan':
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date, e.g. "April 16, 2027" */
				__(
					"Your plan subscription expires on %(date)s. After that, it will be deactivated and you'll no longer be able to use it."
				),
				{ date: fullExpiryDate }
			);
		case 'domain':
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date, e.g. "January 8, 2027" */
				__(
					"Your domain subscription expires on %(date)s. After that, it will be deactivated and you'll no longer be able to use it."
				),
				{ date: fullExpiryDate }
			);
		case 'email':
			return sprintf(
				/* translators: %(date)s is the full subscription expiry date */
				__(
					"Your email subscription expires on %(date)s. After that, it will be deactivated and you'll no longer be able to use it."
				),
				{ date: fullExpiryDate }
			);
		default:
			return sprintf(
				/* translators: %(productName)s is the product name; %(date)s is the full expiry date */
				__(
					"Your %(productName)s subscription expires on %(date)s. After that, it will be deactivated and you'll no longer be able to use it."
				),
				{ productName: purchase.product_name, date: fullExpiryDate }
			);
	}
}

/**
 * Single-sentence copy for the Remove variant when there is exactly one loss
 * item. Domain removals use the domain name; everything else uses the product
 * name.
 */
export function getSingleItemRemoveCopy( purchase: PurchaseForCopy ): string {
	if ( purchase.is_domain_registration ) {
		return sprintf(
			/* translators: %(domainName)s is the domain name being removed, e.g. "example.com" */
			__(
				"%(domainName)s will be removed immediately. It will be deactivated and you'll no longer be able to use it."
			),
			{ domainName: purchase.meta ?? purchase.domain }
		);
	}
	return sprintf(
		/* translators: %(productName)s is the product name */
		__(
			"%(productName)s will be removed immediately. It will be deactivated and you'll no longer be able to use it."
		),
		{ productName: purchase.product_name }
	);
}

/**
 * Single-sentence refund notice on the Remove screen. The losses list intro
 * carries the "removed immediately" timing, so we don't repeat it here.
 */
export function getRefundNoticeCopy( {
	purchase,
	refundAmount,
}: {
	purchase: PurchaseForCopy;
	refundAmount: string;
} ): string {
	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount, e.g. "$96.00" */
				__( 'You’ll receive a %(refundAmount)s refund when you remove your plan.' ),
				{ refundAmount }
			);
		case 'domain':
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount */
				__( 'You’ll receive a %(refundAmount)s refund when you remove your domain.' ),
				{ refundAmount }
			);
		case 'email':
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount */
				__( 'You’ll receive a %(refundAmount)s refund when you remove your email.' ),
				{ refundAmount }
			);
		case 'jetpack':
		case 'akismet':
		case 'marketplace':
		case 'one-time':
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount; %(productName)s is the product name */
				__( 'You’ll receive a %(refundAmount)s refund when you remove %(productName)s.' ),
				{ refundAmount, productName: purchase.product_name }
			);
		default:
			return sprintf(
				/* translators: %(refundAmount)s is a monetary amount */
				__( 'You’ll receive a %(refundAmount)s refund when you remove your subscription.' ),
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
 *
 * Remove intent: primary is always "Continue removal" — the actual deletion
 * runs after the survey, so the confirmation button signals continuation, not
 * the terminal action. Secondary stays per-category so "Keep plan" / "Keep
 * domain" still match the surrounding copy.
 */
export function getButtonLabels( { purchase, intent }: ConfirmationCopyArgs ): {
	primary: string;
	secondary: string;
} {
	const category = getProductCategory( purchase );
	if ( intent === 'remove' ) {
		const primary = __( 'Continue removal' );
		switch ( category ) {
			case 'plan':
				return { primary, secondary: __( 'Keep plan' ) };
			case 'domain':
				return { primary, secondary: __( 'Keep domain' ) };
			case 'email':
				return { primary, secondary: __( 'Keep email' ) };
			case 'marketplace':
				if ( purchase.product_type === 'marketplace_theme' ) {
					return { primary, secondary: __( 'Keep theme' ) };
				}
				return { primary, secondary: __( 'Keep plugin' ) };
			default:
				return { primary, secondary: __( 'Keep subscription' ) };
		}
	}
	if ( intent === 'auto-renew' ) {
		return {
			primary: __( 'Turn off auto-renew' ),
			secondary: __( 'Keep auto-renew on' ),
		};
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
export function getFallbackLossItems( purchase: PurchaseForCopy ): string[] {
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
