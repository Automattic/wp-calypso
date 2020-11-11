/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import {
	hasDomainRegistration,
	hasPlan,
	hasJetpackPlan,
	isNextDomainFree,
} from 'calypso/lib/cart-values/cart-items';
import { getPlan, getBillingMonthsForTerm } from 'calypso/lib/plans';
import { isMonthly } from 'calypso/lib/plans/constants';
import { REGISTER_DOMAIN } from 'calypso/lib/url/support';
import { translationExists } from 'calypso/lib/i18n-utils';

/* eslint-disable wpcalypso/jsx-classname-namespace */

function hasBiennialPlan( cart ) {
	const plans = cart.products
		.map( ( { product_slug } ) => getPlan( product_slug ) )
		.filter( Boolean );
	const plan = plans?.[ 0 ];

	try {
		return getBillingMonthsForTerm( plan?.term ) === 24;
	} catch ( e ) {
		return false;
	}
}

function hasMonthlyPlan( cart ) {
	return cart.products.some( ( { product_slug } ) => isMonthly( product_slug ) );
}

export default function BundledDomainNotice( { cart } ) {
	// A dotcom plan should exist.
	if ( ! hasPlan( cart ) || hasJetpackPlan( cart ) || hasMonthlyPlan( cart ) ) {
		return null;
	}

	// The plan should bundle a free domain
	if ( ! isNextDomainFree( cart ) ) {
		return null;
	}

	// Hide non-translated text for non-English users.
	// TODO: the following lines of code should be removed once all translations are ready.
	if (
		! translationExists(
			'Purchasing a one-year subscription to a WordPress.com plan gives you one year of access to your plan’s features and one year of a custom domain name.'
		)
	) {
		return null;
	}

	const domainRegistrationLink = (
		<a href={ REGISTER_DOMAIN } target="_blank" rel="noopener noreferrer" />
	);

	const oneYearCopy = translate(
		'Purchasing a one-year subscription to a WordPress.com plan gives you one year of access to your plan’s features and one year of a custom domain name.'
	);
	const twoYearCopy = translate(
		'Purchasing a two-year subscription to a WordPress.com plan gives you two years of access to your plan’s features and one year of a custom domain name.'
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
		<div className="checkout__bundled-domain-notice">
			<Gridicon icon="info-outline" size={ 18 } />
			<p>
				{ hasBiennialPlan( cart ) ? twoYearCopy : oneYearCopy }{ ' ' }
				{ hasDomainRegistration( cart ) ? null : registrationLink }{ ' ' }
				{ hasBiennialPlan( cart ) ? afterFirstYear : null }
			</p>
		</div>
	);
}
