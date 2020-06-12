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

// This function is meant to display a path for users to trigger an
// Automated Transfer for their Business sites that still aren't
// supported by the Atomic infrastructure.
export default function wpcomBusinessATController(
	BusinessATComponent: typeof React.Component
): Function {
	return ( context: Context, next: Function ) => {
		if ( isEnabled( 'jetpack-cloud' ) ) {
			return next();
		}
		const getState = context.store.getState;
		const siteId = getSelectedSiteId( getState() );
		const isAtomic = isSiteAutomatedTransfer( getState(), siteId );
		const isJetpack = isJetpackSite( getState(), siteId );
		const currentPlan = getSitePlan( getState(), siteId );

		if ( ! isJetpack && ! isAtomic && isBusinessPlan( currentPlan.product_slug ) ) {
			const sourceProduct = context.path.includes( '/backup/' ) ? 'backup' : 'scan';
			context.primary = <BusinessATComponent product={ sourceProduct } />;
		}

		next();
	};
}
