import {
	isPlan,
	isDomainTransfer,
	isDomainProduct,
	isDotComPlan,
	isGSuiteOrExtraLicenseProductSlug,
	isGoogleWorkspace,
	isTitanMail,
	isP2Plus,
	isJetpackSearch,
	isJetpackProductSlug,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { isWpComProductRenewal as isRenewal } from './is-wpcom-product-renewal';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function getSublabel( serverCartItem: ResponseCartProduct ): string {
	const isRenewalItem = isRenewal( serverCartItem );
	const { meta, product_name: productName, product_slug: productSlug } = serverCartItem;

	// Jetpack Search has its own special sublabel
	if ( ! isRenewalItem && isJetpackSearch( serverCartItem ) ) {
		return '';
	}

	if ( isDotComPlan( serverCartItem ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Plan Renewal' ) );
		}
	}

	if ( isPlan( serverCartItem ) || isJetpackProductSlug( productSlug ) ) {
		if ( isP2Plus( serverCartItem ) ) {
			return String( translate( 'Monthly subscription' ) );
		}

		return isRenewalItem
			? String( translate( 'Plan Renewal' ) )
			: String( translate( 'Plan Subscription' ) );
	}

	if ( isGSuiteOrExtraLicenseProductSlug( productSlug ) || isGoogleWorkspace( serverCartItem ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Productivity Tools and Mailboxes Renewal' ) );
		}

		return String( translate( 'Productivity Tools and Mailboxes' ) );
	}

	if ( isTitanMail( serverCartItem ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Mailboxes Renewal' ) );
		}

		return String( translate( 'Mailboxes' ) );
	}

	if ( meta && ( isDomainProduct( serverCartItem ) || isDomainTransfer( serverCartItem ) ) ) {
		if ( ! isRenewalItem ) {
			return productName || '';
		}

		if ( productName ) {
			return String( translate( '%(productName)s Renewal', { args: { productName } } ) );
		}
	}

	if ( ! isRenewalItem && serverCartItem.months_per_bill_period === 1 ) {
		return String( translate( 'Billed monthly' ) );
	}

	if ( isRenewalItem ) {
		return String( translate( 'Renewal' ) );
	}

	return '';
}

export function getLabel( serverCartItem: ResponseCartProduct ): string {
	if (
		serverCartItem.meta &&
		( isDomainProduct( serverCartItem ) || isDomainTransfer( serverCartItem ) )
	) {
		return serverCartItem.meta;
	}
	return serverCartItem.product_name || '';
}
