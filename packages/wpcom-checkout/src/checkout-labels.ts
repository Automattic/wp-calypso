import {
	isPlan,
	isDomainTransferProduct,
	isDomainProduct,
	isDotComPlan,
	isGSuiteOrGoogleWorkspace,
	isTitanMail,
	isP2Plus,
	isJetpackSearch,
	isRenewal,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function getSublabel( serverCartItem: ResponseCartProduct ): string {
	const isRenewalItem = isRenewal( serverCartItem );
	const { meta, product_name: productName } = serverCartItem;

	// Jetpack Search has its own special sublabel
	if ( ! isRenewalItem && isJetpackSearch( serverCartItem ) ) {
		return '';
	}

	if ( isDotComPlan( serverCartItem ) || ( ! isRenewalItem && isTitanMail( serverCartItem ) ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Plan Renewal' ) );
		}
	}

	if ( isPlan( serverCartItem ) ) {
		if ( isP2Plus( serverCartItem ) ) {
			return String( translate( 'Monthly subscription' ) );
		}

		return isRenewalItem
			? String( translate( 'Plan Renewal' ) )
			: String( translate( 'Plan Subscription' ) );
	}

	if ( isGSuiteOrGoogleWorkspace( serverCartItem ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Productivity and Collaboration Tools Renewal' ) );
		}

		return String( translate( 'Productivity and Collaboration Tools' ) );
	}

	if (
		meta &&
		( isDomainProduct( serverCartItem ) || isDomainTransferProduct( serverCartItem ) )
	) {
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
		( isDomainProduct( serverCartItem ) || isDomainTransferProduct( serverCartItem ) )
	) {
		return serverCartItem.meta;
	}
	return serverCartItem.product_name || '';
}
