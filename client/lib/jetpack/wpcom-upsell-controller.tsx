/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import type { Context } from './types';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import BusinessATSwitch from 'components/jetpack/business-at-switch';
import isSiteOnAtomicPlan from 'state/selectors/is-site-on-atomic-plan';

export default function upsellSwitch(
	UpsellComponent: typeof React.Component,
	BusinessATComponent: typeof React.Component,
): Function {
	return ( context: Context, next: Function ) => {
		const getState = context.store.getState;
		const siteId = getSelectedSiteId( getState() );
		const isJetpack = isJetpackSite( getState(), siteId );

		// Note that isJetpack *includes* Atomic sites, so we don't need to explicitly check for that.
		if ( isJetpack || isEnabled( 'jetpack-cloud' ) ) {
			return next();
		}

		// Show Business plan upsell if it isn't a Jetpack site and it doesn't have
		// a Business plan. Note this will include E-Comm.
		const hasPlanForAT = siteId && isSiteOnAtomicPlan( getState(), siteId );
		if ( ! hasPlanForAT ) {
			context.primary = <UpsellComponent />;
			return next();
		}

		const isAtomic = isSiteAutomatedTransfer( getState(), siteId );
		// Show the Automated Transfer for sites with a Business plan that are not
		// Atomic sites.
		if ( ! isAtomic ) {
			context.primary = (
				<BusinessATSwitch fallbackDisplay={ context.primary } path={ context.path } />
			);
		}
		// Show the Automated Transfer prompt for sites with a Business or E-Comm plan that have not
		// gone through the transfer process yet.
		const primaryProduct = context.path.includes( '/backup/' ) ? 'backup' : 'scan';
		context.primary = <BusinessATComponent product={ primaryProduct } />;

		next();
	};
}
