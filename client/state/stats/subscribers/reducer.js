import { get } from 'lodash';
import { STATS_SUBSCRIBERS_RECEIVE } from 'calypso/state/action-types';

const SubscribrsData = ( state = {}, action ) => {
	switch ( action.type ) {
		case STATS_SUBSCRIBERS_RECEIVE:
			return {
				...state,
				[ action.siteId ]: {
					...get( state, [ action.siteId ], {} ),
					...action.data[ 0 ], // TODO: check the structure once the endpoint returns data
				},
			};
	}

	return state;
};

export default SubscribrsData;
