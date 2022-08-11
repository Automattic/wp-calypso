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
	isGoogleWorkspaceProductSlug,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { isWpComProductRenewal as isRenewal } from './is-wpcom-product-renewal';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function getSublabel( serverCartItem: ResponseCartProduct ): string {
	const isRenewalItem = isRenewal( serverCartItem );
	const { meta, product_name: productName, product_slug: productSlug } = serverCartItem;

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

	if ( isGoogleWorkspace( serverCartItem ) || isGSuiteOrExtraLicenseProductSlug( productSlug ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Mailboxes and Productivity Tools Renewal' ) );
		}

		return String( translate( 'Mailboxes and Productivity Tools' ) );
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

	if ( isAddOn( serverCartItem ) && ! isRenewalItem ) {
		return String( translate( 'Add-On' ) );
	}

	if ( isRenewalItem ) {
		return String( translate( 'Renewal' ) );
	}

	if ( isMonthlyProduct( serverCartItem ) ) {
		return String( translate( 'Billed monthly' ) );
	}

	if ( isYearly( serverCartItem ) ) {
		return String( translate( 'Billed annually' ) );
	}

	if ( isBiennially( serverCartItem ) ) {
		return String( translate( 'Billed every two years' ) );
	}

	return '';
}

export function getSublabelAndPrice( product: ResponseCartProduct ): string | null {
	const productSlug = product.product_slug;
	const sublabel = getSublabel( product );

	if ( isPlan( product ) || isAddOn( product ) || isJetpackProductSlug( productSlug ) ) {
		if ( isP2Plus( product ) ) {
			// This is the price for one item for products with a quantity (eg. seats in a license).
			const itemPrice = product.item_original_cost_for_quantity_one_display;
			const members = product?.current_quantity || 1;
			const p2Options = {
				args: {
					itemPrice,
					members,
				},
				count: members,
			};

			return String(
				translate(
					'Monthly subscription: %(itemPrice)s x %(members)s member',
					'Monthly subscription: %(itemPrice)s x %(members)s members',
					p2Options
				)
			);
		}

		const options = {
			args: {
				sublabel,
				price: product.item_original_subtotal_display,
			},
		};

		if ( isMonthlyProduct( product ) ) {
			return String( translate( '%(sublabel)s: %(price)s per month', options ) );
		}

		if ( isYearly( product ) ) {
			return String( translate( '%(sublabel)s: %(price)s per year', options ) );
		}

		if ( isBiennially( product ) ) {
			return String( translate( '%(sublabel)s: %(price)s per two years', options ) );
		}
	}

	if (
		isGoogleWorkspaceProductSlug( productSlug ) ||
		isGSuiteOrExtraLicenseProductSlug( productSlug ) ||
		isTitanMail( product )
	) {
		let billingInterval = null;

		if ( product.months_per_bill_period === 12 || product.months_per_bill_period === null ) {
			billingInterval = translate( 'billed annually' );
		}

		if ( product.months_per_bill_period === 1 ) {
			billingInterval = translate( 'billed monthly' );
		}

		if ( billingInterval === null ) {
			return sublabel;
		}

		return String(
			translate( '%(productDescription)s: %(billingInterval)s', {
				args: {
					productDescription: sublabel,
					billingInterval,
				},
				comment:
					"Product description and billing interval (already translated) separated by a colon (e.g. 'Mailboxes and Productivity Tools: billed annually')",
			} )
		);
	}

	const isDomainRegistration = product.is_domain_registration;
	const isDomainMapping = productSlug === 'domain_map';

	if ( ( isDomainRegistration || isDomainMapping ) && product.months_per_bill_period === 12 ) {
		const premiumLabel = product.extra?.premium ? translate( 'Premium' ) : null;

		return String(
			translate( '%(premiumLabel)s %(sublabel)s: %(interval)s', {
				args: {
					premiumLabel,
					sublabel: sublabel,
					interval: translate( 'billed annually' ),
				},
				comment:
					'premium label, product type and billing interval, separated by a colon. ex: ".blog domain registration: billed annually" or "Premium .blog domain registration: billed annually"',
			} )
		);
	}

	return sublabel || null;
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
