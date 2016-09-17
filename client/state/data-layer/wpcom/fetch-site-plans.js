import i18n from 'i18n-calypso';
import wpcom from 'lib/wp';
import { fetchSitePlansCompleted } from 'state/sites/plans/actions';

import {
	SITE_PLANS_FETCH,
	SITE_PLANS_FETCH_FAILED,
} from 'state/action-types';

export const fetchSitePlans = ( { dispatch } ) => ( { siteId } ) => {
	wpcom
		.undocumented()
		.getSitePlans( siteId, ( error, data ) => {
			if ( ! error ) {
				return dispatch( fetchSitePlansCompleted( siteId, data ) );
			}

			dispatch( {
				type: SITE_PLANS_FETCH_FAILED,
				siteId,
				error: error.message || i18n.translate(
					'There was a problem fetching site plans. ' +
					'Please try again later or contact support.'
				)
			} );
		} );
};

export default [ SITE_PLANS_FETCH, fetchSitePlans ];
