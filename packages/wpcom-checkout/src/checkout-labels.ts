import {
	isAddOn,
	isPlan,
	isDomainTransfer,
	isDomainProduct,
	isDotComPlan,
	isGoogleWorkspace,
	isGSuiteOrExtraLicenseProductSlug,
	isTitanMail,
	isP2Plus,
	isJetpackProductSlug,
	isMonthlyProduct,
	isYearly,
	isBiennially,
	isTriennially,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { isWpComProductRenewal as isRenewal } from './is-wpcom-product-renewal';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function DefaultLineItemSublabel( { product }: { product: ResponseCartProduct } ) {
	const isRenewalItem = isRenewal( product );
	const { meta, product_name: productName, product_slug: productSlug } = product;

	if ( isDotComPlan( product ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Plan Renewal' ) );
		}
	}

	if ( isPlan( product ) || isJetpackProductSlug( productSlug ) ) {
		if ( isP2Plus( product ) ) {
			return String( translate( 'Monthly subscription' ) );
		}

		return isRenewalItem
			? String( translate( 'Plan Renewal' ) )
			: String( translate( 'Plan Subscription' ) );
	}

	if ( isGoogleWorkspace( product ) || isGSuiteOrExtraLicenseProductSlug( productSlug ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Mailboxes and Productivity Tools Renewal' ) );
		}

		return String( translate( 'Mailboxes and Productivity Tools' ) );
	}

	if ( isTitanMail( product ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Mailboxes Renewal' ) );
		}

		return String( translate( 'Mailboxes' ) );
	}

	if ( meta && ( isDomainProduct( product ) || isDomainTransfer( product ) ) ) {
		if ( ! isRenewalItem ) {
			return productName || '';
		}

		if ( productName ) {
			return String( translate( '%(productName)s Renewal', { args: { productName } } ) );
		}
	}

	if ( isAddOn( product ) && ! isRenewalItem ) {
		return String( translate( 'Add-On' ) );
	}

	if ( isRenewalItem ) {
		return String( translate( 'Renewal' ) );
	}

	if ( isMonthlyProduct( product ) ) {
		return String( translate( 'Billed monthly' ) );
	}

	if ( isYearly( product ) ) {
		return String( translate( 'Billed annually' ) );
	}

	if ( isBiennially( product ) ) {
		return String( translate( 'Billed every two years' ) );
	}

	if ( isTriennially( product ) ) {
		return String( translate( 'Billed every three years' ) );
	}

	return null;
}

export function getLabel( product: ResponseCartProduct ): string {
	if ( product.meta && ( isDomainProduct( product ) || isDomainTransfer( product ) ) ) {
		return product.meta;
	}
	return product.product_name || '';
}
