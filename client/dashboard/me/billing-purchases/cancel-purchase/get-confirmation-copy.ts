import { __, sprintf } from '@wordpress/i18n';
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

type ConfirmationCopyArgs = {
	purchase: Purchase;
	intent: CancelIntent;
	expiryDateFormatted: string;
};

/**
 * Screen heading, e.g. "Cancel plan" / "Remove domain".
 */
export function getCancellationHeading( { purchase, intent }: ConfirmationCopyArgs ): string {
	const category = getProductCategory( purchase );
	if ( intent === 'remove' ) {
		switch ( category ) {
			case 'plan':
				return __( 'Remove plan' );
			case 'domain':
				return __( 'Remove domain' );
			case 'email':
				return __( 'Remove email' );
			case 'one-time':
				return __( 'Remove purchase' );
			default:
				return __( 'Remove subscription' );
		}
	}
	switch ( category ) {
		case 'plan':
			return __( 'Cancel plan' );
		case 'domain':
			return __( 'Cancel domain' );
		case 'email':
			return __( 'Cancel email' );
		case 'one-time':
			return __( 'Cancel purchase' );
		default:
			return __( 'Cancel subscription' );
	}
}

/**
 * Top-of-screen notice for the Cancel variant. Returns null when there's no
 * useful date to surface (e.g. one-time purchases).
 */
export function getTopNoticeCopy( {
	purchase,
	intent,
	expiryDateFormatted,
}: ConfirmationCopyArgs ): string | null {
	if ( intent !== 'cancel' ) {
		return null;
	}
	if ( ! expiryDateFormatted ) {
		return null;
	}
	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return sprintf(
				/* translators: %(date)s is the subscription expiry date */
				__( 'Your plan is active until %(date)s.' ),
				{ date: expiryDateFormatted }
			);
		case 'domain':
			return sprintf(
				/* translators: %(date)s is the subscription expiry date */
				__( 'Your domain is active until %(date)s.' ),
				{ date: expiryDateFormatted }
			);
		case 'email':
			return sprintf(
				/* translators: %(date)s is the subscription expiry date */
				__( 'Your email is active until %(date)s.' ),
				{ date: expiryDateFormatted }
			);
		case 'one-time':
			return null;
		default:
			return sprintf(
				/* translators: %(productName)s is the product name, %(date)s is the expiry date */
				__( 'Your %(productName)s subscription is active until %(date)s.' ),
				{ productName: purchase.product_name, date: expiryDateFormatted }
			);
	}
}

/**
 * Checkbox label the user must tick before confirming. Always includes the
 * expiry date for Cancel variant (the one date we keep on the screen).
 */
export function getCheckboxLabel( {
	purchase,
	intent,
	expiryDateFormatted,
}: ConfirmationCopyArgs ): string {
	const category = getProductCategory( purchase );
	if ( intent === 'remove' ) {
		switch ( category ) {
			case 'plan':
				return __( 'I understand my plan will be removed immediately.' );
			case 'domain':
				return __( 'I understand my domain will be removed immediately.' );
			case 'email':
				return __( 'I understand my email will be removed immediately.' );
			default:
				return __( 'I understand my subscription will be removed immediately.' );
		}
	}

	// Cancel variant
	if ( ! expiryDateFormatted ) {
		// One-time or partner-managed: no meaningful date
		return __( 'I understand my subscription will be cancelled.' );
	}
	switch ( category ) {
		case 'plan':
			return sprintf(
				/* translators: %(date)s is the expiry date */
				__( 'I understand my plan will expire on %(date)s.' ),
				{ date: expiryDateFormatted }
			);
		case 'domain':
			return sprintf(
				/* translators: %(date)s is the expiry date */
				__( 'I understand my domain will expire on %(date)s.' ),
				{ date: expiryDateFormatted }
			);
		case 'email':
			return sprintf(
				/* translators: %(date)s is the expiry date */
				__( 'I understand my email will expire on %(date)s.' ),
				{ date: expiryDateFormatted }
			);
		default:
			return sprintf(
				/* translators: %(date)s is the expiry date */
				__( 'I understand my subscription will expire on %(date)s.' ),
				{ date: expiryDateFormatted }
			);
	}
}

/**
 * Primary and secondary button labels.
 */
export function getButtonLabels( {
	purchase,
	intent,
}: Omit< ConfirmationCopyArgs, 'expiryDateFormatted' > ): {
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
	switch ( category ) {
		case 'plan':
			return { primary: __( 'Cancel plan' ), secondary: __( 'Keep plan' ) };
		case 'domain':
			return { primary: __( 'Cancel domain' ), secondary: __( 'Keep domain' ) };
		case 'email':
			return { primary: __( 'Cancel email' ), secondary: __( 'Keep email' ) };
		default:
			return {
				primary: __( 'Cancel subscription' ),
				secondary: __( 'Keep subscription' ),
			};
	}
}

/**
 * One-item fallback losses list for products without a server-provided
 * cancellation features list. Keeps every confirmation screen showing at
 * least one concrete item the user is giving up.
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
