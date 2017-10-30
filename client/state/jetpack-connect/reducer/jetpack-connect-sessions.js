/** @format */
/**
 * External dependencis
 */
import { pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { DESERIALIZE, JETPACK_CONNECT_CHECK_URL, SERIALIZE } from 'state/action-types';
import { isValidStateWithSchema } from 'state/utils';
import { jetpackConnectSessionsSchema } from './schema';
import { isStale } from '../utils';
import { urlToSlug } from 'lib/url';

function buildUrlSessionObj( url, flowType ) {
	const slug = urlToSlug( url );
	const sessionValue = {
		timestamp: Date.now(),
		flowType: flowType || '',
	};
	return { [ slug ]: sessionValue };
}

export default function jetpackConnectSessions( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_CONNECT_CHECK_URL:
			return Object.assign( {}, state, buildUrlSessionObj( action.url, action.flowType ) );
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, jetpackConnectSessionsSchema ) ) {
				return pickBy( state, session => {
					return ! isStale( session.timestamp );
				} );
			}
			return {};
		case SERIALIZE:
			return state;
	}
	return state;
}
jetpackConnectSessions.hasCustomPersistence = true;
