/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import type { Context } from './types';
import { isBusinessPlan } from 'lib/plans';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { getSitePlan, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import BusinessATSwitch from 'components/jetpack/business-at-switch';

export default function upsellSwitch( UpsellComponent: typeof React.Component ): Function {
	return ( context: Context, next: Function ) => {
		const getState = context.store.getState;
		const siteId = getSelectedSiteId( getState() );
		const isJetpack = isJetpackSite( getState(), siteId );

		if ( isJetpack || isEnabled( 'jetpack-cloud' ) ) {
			return next();
		}

		const currentPlan = getSitePlan( getState(), siteId );
		const isBusiness = isBusinessPlan( currentPlan.product_slug );

		// Show Business plan upsell if it isn't a Jetpack site and it doesn't have
		// a Business plan
		if ( ! isBusiness ) {
			context.primary = <UpsellComponent />;
		}

		const isAtomic = isSiteAutomatedTransfer( getState(), siteId );
		// Show the Automated Transfer for sites with a Business plan that are not
		// Atomic sites.
		if ( isBusiness && ! isAtomic ) {
			context.primary = (
				<BusinessATSwitch fallbackDisplay={ context.primary } path={ context.path } />
			);
		}

		next();
	};
}
