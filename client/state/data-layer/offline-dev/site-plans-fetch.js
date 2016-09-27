import { fetchSitePlansCompleted } from 'state/sites/plans/actions';

import {
	SITE_PLANS_FETCH,
} from 'state/action-types';

import sitePlans from './data/site-plans';

export const fetchSitePlans = ( { dispatch } ) => ( { siteId } ) => {
	return dispatch( fetchSitePlansCompleted( siteId, sitePlans ) );
};

export default [ SITE_PLANS_FETCH, fetchSitePlans ];
