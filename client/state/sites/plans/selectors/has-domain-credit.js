/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { initialSiteState } from 'calypso/state/sites/plans/reducer';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors/get-current-plan';

export function hasDomainCredit( state, siteId ) {
	if ( ! siteId ) {
		return initialSiteState;
	}
	const currentPlan = getCurrentPlan( state, siteId );
	return get( currentPlan, 'hasDomainCredit', null );
}
