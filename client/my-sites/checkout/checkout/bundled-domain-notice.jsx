/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import { hasPlan, hasJetpackPlan, isNextDomainFree } from 'lib/cart-values/cart-items';
import Gridicon from 'components/gridicon';
import { getPlan, getBillingMonthsForTerm } from 'lib/plans';
import { REGISTER_DOMAIN } from 'lib/url/support';

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

export default function BundledDomainNotice( { cart } ) {
	// A dotcom plan should exist.
	if ( ! hasPlan( cart ) || hasJetpackPlan( cart ) ) {
		return null;
	}

	// The plan should bundle a free domain
	if ( ! isNextDomainFree( cart ) ) {
		return null;
	}

	const domainRegistrationLink = (
		<a href={ REGISTER_DOMAIN } target="_blank" rel="noopener noreferrer" />
	);

	let copy = translate(
		'Purchasing a one-year subscription to a WordPress.com plan gives you one year of access to your plan’s features and one year of a custom domain name. To select your custom domain, follow {{domainRegistrationLink}}the registration instructions{{/domainRegistrationLink}}.',
		{
			components: {
				domainRegistrationLink,
			},
		}
	);

	if ( hasBiennialPlan( cart ) ) {
		copy = translate(
			'Purchasing a two-year subscription to a WordPress.com plan gives you two years of access to your plan’s features and one-year of a custom domain name. To select your custom domain, follow {{domainRegistrationLink}}the registration instructions{{/domainRegistrationLink}}. ' +
				'After the first year, you’ll continue to have access to your WordPress.com plan features but will need to renew the domain name.',
			{
				components: {
					domainRegistrationLink,
				},
			}
		);
	}

	return (
		<div className="checkout__bundled-domain-notice">
			<Gridicon icon="info-outline" size={ 18 } />
			<p>{ copy }</p>
		</div>
	);
}
