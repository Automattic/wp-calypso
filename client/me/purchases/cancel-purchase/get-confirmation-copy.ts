import {
	isPlan,
	isDomainRegistration,
	isGSuiteOrGoogleWorkspace,
	isTitanMail,
	isAkismetProduct,
	isJetpackPlan,
	isJetpackProduct,
} from '@automattic/calypso-products';
import { Purchases } from '@automattic/data-stores';
import { translate } from 'i18n-calypso';
import { isOneTimePurchase, getName } from 'calypso/lib/purchases';
import type { CancelIntent } from 'calypso/lib/purchases/utils';

/**
 * Product-type buckets for confirmation-screen copy. Keep this mirrored to the
 * dashboard helper at
 * client/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy.ts —
 * the legacy and dashboard Purchase types differ (camelCase vs. snake_case)
 * so the helpers are split, but the copy must match.
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

function isMarketplacePluginPurchase( purchase: Purchases.Purchase ): boolean {
	const productType = purchase.productType ?? '';
	return productType.startsWith( 'marketplace' ) || productType === 'saas_plugin';
}

export function getProductCategory( purchase: Purchases.Purchase ): ProductCategory {
	if ( isOneTimePurchase( purchase ) ) {
		return 'one-time';
	}
	if ( isPlan( purchase ) ) {
		return 'plan';
	}
	if ( isDomainRegistration( purchase ) ) {
		return 'domain';
	}
	if ( isGSuiteOrGoogleWorkspace( purchase ) || isTitanMail( purchase ) ) {
		return 'email';
	}
	if ( isAkismetProduct( purchase ) ) {
		return 'akismet';
	}
	if ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) ) {
		return 'jetpack';
	}
	if ( isMarketplacePluginPurchase( purchase ) ) {
		return 'marketplace';
	}
	return 'other';
}

type ConfirmationCopyArgs = {
	purchase: Purchases.Purchase;
	intent: CancelIntent;
	expiryDateFormatted: string;
};

export function getCancellationHeading( { purchase, intent }: ConfirmationCopyArgs ): string {
	const category = getProductCategory( purchase );
	if ( intent === 'remove' ) {
		switch ( category ) {
			case 'plan':
				return translate( 'Remove plan' );
			case 'domain':
				return translate( 'Remove domain' );
			case 'email':
				return translate( 'Remove email' );
			case 'one-time':
				return translate( 'Remove purchase' );
			default:
				return translate( 'Remove subscription' );
		}
	}
	switch ( category ) {
		case 'plan':
			return translate( 'Cancel plan' );
		case 'domain':
			return translate( 'Cancel domain' );
		case 'email':
			return translate( 'Cancel email' );
		case 'one-time':
			return translate( 'Cancel purchase' );
		default:
			return translate( 'Cancel subscription' );
	}
}

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
			return translate( 'Your plan is active until %(date)s.', {
				args: { date: expiryDateFormatted },
			} ) as string;
		case 'domain':
			return translate( 'Your domain is active until %(date)s.', {
				args: { date: expiryDateFormatted },
			} ) as string;
		case 'email':
			return translate( 'Your email is active until %(date)s.', {
				args: { date: expiryDateFormatted },
			} ) as string;
		case 'one-time':
			return null;
		default:
			return translate( 'Your %(productName)s subscription is active until %(date)s.', {
				args: { productName: getName( purchase ), date: expiryDateFormatted },
			} ) as string;
	}
}

export function getCheckboxLabel( {
	purchase,
	intent,
	expiryDateFormatted,
}: ConfirmationCopyArgs ): string {
	const category = getProductCategory( purchase );
	if ( intent === 'remove' ) {
		switch ( category ) {
			case 'plan':
				return translate( 'I understand my plan will be removed immediately.' );
			case 'domain':
				return translate( 'I understand my domain will be removed immediately.' );
			case 'email':
				return translate( 'I understand my email will be removed immediately.' );
			default:
				return translate( 'I understand my subscription will be removed immediately.' );
		}
	}

	if ( ! expiryDateFormatted ) {
		return translate( 'I understand my subscription will be cancelled.' );
	}
	switch ( category ) {
		case 'plan':
			return translate( 'I understand my plan will expire on %(date)s.', {
				args: { date: expiryDateFormatted },
			} ) as string;
		case 'domain':
			return translate( 'I understand my domain will expire on %(date)s.', {
				args: { date: expiryDateFormatted },
			} ) as string;
		case 'email':
			return translate( 'I understand my email will expire on %(date)s.', {
				args: { date: expiryDateFormatted },
			} ) as string;
		default:
			return translate( 'I understand my subscription will expire on %(date)s.', {
				args: { date: expiryDateFormatted },
			} ) as string;
	}
}

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
				return { primary: translate( 'Remove plan' ), secondary: translate( 'Keep plan' ) };
			case 'domain':
				return { primary: translate( 'Remove domain' ), secondary: translate( 'Keep domain' ) };
			case 'email':
				return { primary: translate( 'Remove email' ), secondary: translate( 'Keep email' ) };
			default:
				return {
					primary: translate( 'Remove subscription' ),
					secondary: translate( 'Keep subscription' ),
				};
		}
	}
	switch ( category ) {
		case 'plan':
			return { primary: translate( 'Cancel plan' ), secondary: translate( 'Keep plan' ) };
		case 'domain':
			return { primary: translate( 'Cancel domain' ), secondary: translate( 'Keep domain' ) };
		case 'email':
			return { primary: translate( 'Cancel email' ), secondary: translate( 'Keep email' ) };
		default:
			return {
				primary: translate( 'Cancel subscription' ),
				secondary: translate( 'Keep subscription' ),
			};
	}
}

export function getFallbackLossItems( purchase: Purchases.Purchase ): string[] {
	const category = getProductCategory( purchase );
	const productName = getName( purchase );
	switch ( category ) {
		case 'plan':
			return [ translate( 'All %(productName)s features', { args: { productName } } ) as string ];
		case 'domain':
			return [
				translate( 'Your domain at %(domainName)s', {
					args: { domainName: purchase.meta ?? purchase.domain ?? productName },
				} ) as string,
			];
		case 'email':
			if ( isGSuiteOrGoogleWorkspace( purchase ) ) {
				return [ translate( 'Your Google Workspace accounts' ) as string ];
			}
			return [ translate( 'Your professional email accounts' ) as string ];
		case 'jetpack':
			return [ translate( '%(productName)s protection', { args: { productName } } ) as string ];
		case 'akismet':
			return [ translate( 'Akismet spam protection' ) as string ];
		case 'marketplace':
			return [ translate( '%(productName)s and its data', { args: { productName } } ) as string ];
		case 'one-time':
			return [ productName ];
		default:
			return [
				translate( 'Your %(productName)s subscription', { args: { productName } } ) as string,
			];
	}
}
