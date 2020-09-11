/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { initialSiteState } from 'state/sites/plans/reducer';
import { getCurrentPlan } from 'state/sites/plans/selectors/get-current-plan';

export function hasDomainCredit( state, siteId ) {
	if ( ! siteId ) {
		return initialSiteState;
	}
	const currentPlan = getCurrentPlan( state, siteId );
	return get( currentPlan, 'hasDomainCredit', null );
}
