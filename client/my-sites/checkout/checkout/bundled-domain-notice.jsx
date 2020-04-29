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

export default function BundledDomainNotice( { cart } ) {
	// A dotcom plan should exist.
	if ( ! hasPlan( cart ) || hasJetpackPlan( cart ) ) {
		return null;
	}

	// The plan should bundle a free domain
	if ( ! isNextDomainFree( cart ) ) {
		return null;
	}

	return (
		<div className="checkout__bundled-domain-notice">
			<Gridicon icon="info-outline" size={ 18 } />
			<p>
				{ translate(
					'By purchasing a year WordPress.com Plan, you will gain access to related plan features for 2 years and 1 year of custom domain name. Your domain name needs to be registered to become active.'
				) }
			</p>
		</div>
	);
}
