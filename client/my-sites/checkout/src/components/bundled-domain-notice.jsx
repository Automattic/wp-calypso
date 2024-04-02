import { isMonthly, getPlan, getBillingMonthsForTerm } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { REGISTER_DOMAIN } from '@automattic/urls';
import { translate } from 'i18n-calypso';
import {
	hasDomainRegistration,
	hasPlan,
	hasJetpackPlan,
	isNextDomainFree,
	hasP2PlusPlan,
	has100YearPlan,
} from 'calypso/lib/cart-values/cart-items';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';

/* eslint-disable wpcalypso/jsx-classname-namespace */

function getBillingMonthsForPlan( cart ) {
	const plans = cart.products
		.map( ( { product_slug } ) => getPlan( product_slug ) )
		.filter( Boolean );
	const plan = plans?.[ 0 ];

	try {
		return getBillingMonthsForTerm( plan?.term );
	} catch ( e ) {
		return 0;
	}
}

function hasBiennialPlan( cart ) {
	return getBillingMonthsForPlan( cart ) === 24;
}

function hasTriennialPlan( cart ) {
	return getBillingMonthsForPlan( cart ) === 36;
}

function hasMonthlyPlan( cart ) {
	return cart.products.some( ( { product_slug } ) => isMonthly( product_slug ) );
}

function getCopyForBillingTerm( cart ) {
	if ( hasBiennialPlan( cart ) ) {
		return translate(
			'Purchasing a two-year subscription to a WordPress.com plan gives you two years of access to your plan’s features and one year of a custom domain name.'
		);
	}
	if ( hasTriennialPlan( cart ) ) {
		return translate(
			'Purchasing a three-year subscription to a WordPress.com plan gives you three years of access to your plan’s features and one year of a custom domain name.'
		);
	}
	return translate(
		'Purchasing a one-year subscription to a WordPress.com plan gives you one year of access to your plan’s features and one year of a custom domain name.'
	);
}

/**
 * Use showBundledDomainNotice to manage BundleDomainNotice visibility when called.
 * @param {import('@automattic/shopping-cart').ResponseCart} cart
 * @returns boolean
 */
export const showBundledDomainNotice = ( cart ) => {
	const isGiftPurchase = cart.is_gift_purchase;

	if ( isGiftPurchase ) {
		return false;
	}

	// A dotcom plan should exist.
	if (
		! hasPlan( cart ) ||
		hasJetpackPlan( cart ) ||
		hasMonthlyPlan( cart ) ||
		hasP2PlusPlan( cart ) ||
		has100YearPlan( cart )
	) {
		return false;
	}

	// The plan should bundle a free domain
	if ( ! isNextDomainFree( cart ) ) {
		return false;
	}

	return true;
};

export default function BundledDomainNotice( { cart } ) {
	const domainRegistrationLink = (
		<a href={ localizeUrl( REGISTER_DOMAIN ) } target="_blank" rel="noopener noreferrer" />
	);

	const afterFirstYear = translate(
		'After the first year, you’ll continue to have access to your WordPress.com plan features but will need to renew the domain name.',
		{
			comment: 'After the first year of the bundled domain...',
		}
	);
	const registrationLink = translate(
		'To select your custom domain, follow {{domainRegistrationLink}}the registration instructions{{/domainRegistrationLink}}.',
		{
			comment:
				'The custom domain here is a free bundled domain. "To select" can be replaced with "to register" or "to claim".',
			components: {
				domainRegistrationLink,
			},
		}
	);

	return (
		<CheckoutTermsItem>
			{ getCopyForBillingTerm( cart ) } { hasDomainRegistration( cart ) ? null : registrationLink }{ ' ' }
			{ hasBiennialPlan( cart ) ? afterFirstYear : null }
		</CheckoutTermsItem>
	);
}
