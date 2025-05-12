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
	isJetpackAISlug,
	isJetpackStatsPaidTieredProductSlug,
} from '@automattic/calypso-products';
import { formatNumber } from '@automattic/number-formatters';
import { translate } from 'i18n-calypso';
import { isWpComProductRenewal as isRenewal } from './is-wpcom-product-renewal';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function DefaultLineItemSublabel( { product }: { product: ResponseCartProduct } ) {
	const isRenewalItem = isRenewal( product );
	const { meta, product_name: productName, product_slug: productSlug } = product;

	if ( isDotComPlan( product ) ) {
		if ( isRenewalItem ) {
			return translate( 'Plan Renewal' );
		}
	}

	if ( isPlan( product ) || isJetpackProductSlug( productSlug ) ) {
		if ( isP2Plus( product ) ) {
			return translate( 'Monthly subscription' );
		}

		return isRenewalItem ? translate( 'Plan Renewal' ) : translate( 'Plan Subscription' );
	}

	if ( isGoogleWorkspace( product ) || isGSuiteOrExtraLicenseProductSlug( productSlug ) ) {
		if ( isRenewalItem ) {
			return translate( 'Mailboxes and Productivity Tools Renewal' );
		}

		return translate( 'Mailboxes and Productivity Tools' );
	}

	if ( isTitanMail( product ) ) {
		if ( isRenewalItem ) {
			return translate( 'Mailboxes Renewal' );
		}

		return translate( 'Mailboxes' );
	}

	if ( meta && ( isDomainProduct( product ) || isDomainTransfer( product ) ) ) {
		if ( ! isRenewalItem ) {
			return productName || '';
		}

		if ( productName ) {
			return translate( '%(productName)s Renewal', { args: { productName } } );
		}
	}

	if ( isAddOn( product ) && ! isRenewalItem ) {
		return translate( 'Add-On' );
	}

	if ( isRenewalItem ) {
		return translate( 'Renewal' );
	}

	if ( isMonthlyProduct( product ) ) {
		return translate( 'Billed monthly' );
	}

	if ( isYearly( product ) ) {
		return translate( 'Billed annually' );
	}

	if ( isBiennially( product ) ) {
		return translate( 'Billed every two years' );
	}

	if ( isTriennially( product ) ) {
		return translate( 'Billed every three years' );
	}

	return null;
}

export function getLabel( product: ResponseCartProduct ): string {
	if ( product.meta && ( isDomainProduct( product ) || isDomainTransfer( product ) ) ) {
		return product.meta;
	}

	// In theory, it'll fallback to 0, but just in case.
	const quantity = product.quantity || product.current_quantity || 0;

	if ( isJetpackAISlug( product.product_slug ) && quantity > 1 ) {
		return translate( '%(productName)s (%(quantity)d requests per month)', {
			args: {
				productName: product.product_name,
				quantity: quantity,
			},
			textOnly: true,
		} );
	}

	if ( isJetpackStatsPaidTieredProductSlug( product.product_slug ) && product.quantity ) {
		return translate( '%(productName)s - %(quantity)s views per month', {
			args: {
				productName: product.product_name,
				quantity: formatNumber( product.quantity, { decimals: 0 } ),
			},
			textOnly: true,
		} );
	}

	return product.product_name || '';
}
