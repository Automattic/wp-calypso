/**
 * External dependencies
 */
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import { initialSiteState } from './reducer';

export function getPlansBySite( state, site ) {
	if ( ! site ) {
		return initialSiteState;
	}
	return getPlansBySiteId( state, site.ID );
}

export function getPlansBySiteId( state, siteId ) {
	if ( ! siteId ) {
		return initialSiteState;
	}
	return state.sites.plans[ siteId ] || initialSiteState;
}

export function hasDomainCredit( state, siteId ) {
	const plans = getPlansBySiteId( state, siteId );
	if ( plans.data ) {
		const currentPlan = find( plans.data, 'currentPlan' );
		return currentPlan.hasDomainCredit;
	}
	return null;
}
