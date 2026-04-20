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
import moment from 'moment';
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

/**
 * "1 month and 11 days" / "14 days" / "2 years and 3 months" etc.
 * Returns an empty string when the expiry is today or in the past.
 */
export function formatTimeRemaining(
	expiryDate: string | Date | null | undefined,
	from: moment.Moment = moment()
): string {
	if ( ! expiryDate ) {
		return '';
	}
	const end = moment( expiryDate );
	if ( ! end.isValid() || end.isSameOrBefore( from, 'day' ) ) {
		return '';
	}

	// Compute years → months → days remainder by stepping through a clone.
	const cursor = from.clone();
	const years = end.diff( cursor, 'years' );
	cursor.add( years, 'years' );
	const months = end.diff( cursor, 'months' );
	cursor.add( months, 'months' );
	const days = end.diff( cursor, 'days' );

	const parts: string[] = [];
	if ( years > 0 ) {
		parts.push(
			translate( '%d year', '%d years', {
				count: years,
				args: years,
			} ) as string
		);
	}
	if ( months > 0 ) {
		parts.push(
			translate( '%d month', '%d months', {
				count: months,
				args: months,
			} ) as string
		);
	}
	// Only include the days portion when we have fewer than a year. Past that,
	// "2 years and 3 months and 14 days" is noise.
	if ( days > 0 && years === 0 ) {
		parts.push(
			translate( '%d day', '%d days', {
				count: days,
				args: days,
			} ) as string
		);
	}

	if ( parts.length === 0 ) {
		return '';
	}
	if ( parts.length === 1 ) {
		return parts[ 0 ];
	}
	if ( parts.length === 2 ) {
		return translate( '%(first)s and %(second)s', {
			args: { first: parts[ 0 ], second: parts[ 1 ] },
			comment: 'joins two duration parts, e.g. "1 month and 11 days"',
		} ) as string;
	}
	return translate( '%(first)s, %(second)s, and %(third)s', {
		args: { first: parts[ 0 ], second: parts[ 1 ], third: parts[ 2 ] },
		comment: 'joins three duration parts, e.g. "2 years, 3 months, and 14 days"',
	} ) as string;
}

type ConfirmationCopyArgs = {
	purchase: Purchases.Purchase;
	intent: CancelIntent;
};

export function getCancellationHeading( { purchase, intent }: ConfirmationCopyArgs ): string {
	if ( intent === 'cancel' ) {
		return translate( 'Cancel subscription' );
	}
	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return translate( 'Remove plan' );
		case 'domain':
			return translate( 'Remove domain' );
		case 'email':
			return translate( 'Remove email' );
		case 'jetpack':
		case 'akismet':
		case 'marketplace':
		case 'one-time':
			return translate( 'Remove %(productName)s', {
				args: { productName: getName( purchase ) },
				comment: 'e.g. "Remove Jetpack Search"',
			} ) as string;
		default:
			return translate( 'Remove subscription' );
	}
}

export function getTopNoticeCopy( { purchase, intent }: ConfirmationCopyArgs ): string | null {
	if ( intent !== 'cancel' ) {
		return null;
	}
	if ( ! purchase.expiryDate ) {
		return null;
	}
	const duration = formatTimeRemaining( purchase.expiryDate );
	if ( ! duration ) {
		return null;
	}

	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return translate(
				'Your plan features will be available for another %(duration)s after you cancel your subscription.',
				{
					args: { duration },
					comment: '%(duration)s is a human-readable duration, e.g. "1 month and 11 days"',
				}
			) as string;
		case 'domain':
			return translate(
				'Your domain will remain active for another %(duration)s after you cancel.',
				{ args: { duration } }
			) as string;
		case 'email':
			return translate(
				'Your email will remain active for another %(duration)s after you cancel.',
				{ args: { duration } }
			) as string;
		case 'one-time':
			return null;
		default:
			return translate(
				'%(productName)s will remain active for another %(duration)s after you cancel your subscription.',
				{ args: { productName: getName( purchase ), duration } }
			) as string;
	}
}

export function getCancelLossIntro( purchase: Purchases.Purchase, fullExpiryDate: string ): string {
	const category = getProductCategory( purchase );
	if ( ! fullExpiryDate ) {
		return translate( 'You’ll lose access to:' );
	}
	switch ( category ) {
		case 'plan':
			return translate(
				'When you cancel your subscription, your %(productName)s plan features will expire on %(date)s and you’ll lose access to:',
				{ args: { productName: getName( purchase ), date: fullExpiryDate } }
			) as string;
		case 'domain':
			return translate(
				'When you cancel your subscription, your domain will expire on %(date)s and you’ll lose access to:',
				{ args: { date: fullExpiryDate } }
			) as string;
		case 'email':
			return translate(
				'When you cancel your subscription, your email will expire on %(date)s and you’ll lose access to:',
				{ args: { date: fullExpiryDate } }
			) as string;
		case 'jetpack':
		case 'akismet':
		case 'marketplace':
		case 'one-time':
			return translate(
				'When you cancel your subscription, %(productName)s will expire on %(date)s and you’ll lose access to:',
				{ args: { productName: getName( purchase ), date: fullExpiryDate } }
			) as string;
		default:
			return translate(
				'When you cancel your subscription, it will expire on %(date)s and you’ll lose access to:',
				{ args: { date: fullExpiryDate } }
			) as string;
	}
}

export function getRemoveLossIntro( purchase: Purchases.Purchase ): string {
	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return translate( 'When you remove your plan, you’ll lose access to:' );
		case 'domain':
			return translate( 'When you remove your domain, you’ll lose access to:' );
		case 'email':
			return translate( 'When you remove your email, you’ll lose access to:' );
		case 'jetpack':
		case 'akismet':
		case 'marketplace':
		case 'one-time':
			return translate( 'When you remove %(productName)s, you’ll lose access to:', {
				args: { productName: getName( purchase ) },
			} ) as string;
		default:
			return translate( 'When you remove your subscription, you’ll lose access to:' );
	}
}

export function getRefundNoticeCopy( {
	purchase,
	refundAmount,
}: {
	purchase: Purchases.Purchase;
	refundAmount: string;
} ): string {
	const category = getProductCategory( purchase );
	switch ( category ) {
		case 'plan':
			return translate(
				'You’ll receive a %(refundAmount)s refund when you remove your plan. Your plan features will be removed right away.',
				{ args: { refundAmount } }
			) as string;
		case 'domain':
			return translate(
				'You’ll receive a %(refundAmount)s refund when you remove your domain. Your domain will be removed right away.',
				{ args: { refundAmount } }
			) as string;
		case 'email':
			return translate(
				'You’ll receive a %(refundAmount)s refund when you remove your email. Your email will be removed right away.',
				{ args: { refundAmount } }
			) as string;
		case 'jetpack':
		case 'akismet':
		case 'marketplace':
		case 'one-time':
			return translate(
				'You’ll receive a %(refundAmount)s refund when you remove %(productName)s. %(productName)s will be removed right away.',
				{ args: { refundAmount, productName: getName( purchase ) } }
			) as string;
		default:
			return translate(
				'You’ll receive a %(refundAmount)s refund when you remove your subscription. Your subscription will be removed right away.',
				{ args: { refundAmount } }
			) as string;
	}
}

export function getCheckboxLabel(): string {
	return translate( 'I’ve reviewed what I’ll lose and want to proceed.' );
}

export function getButtonLabels( { purchase, intent }: ConfirmationCopyArgs ): {
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
	return {
		primary: translate( 'Cancel subscription' ),
		secondary: translate( 'Keep subscription' ),
	};
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
