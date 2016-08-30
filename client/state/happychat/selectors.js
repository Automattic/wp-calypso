/**
 * External dependencies
 */
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import assign from 'lodash/assign';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

const debug = require( 'debug' )( 'calypso:happychat:selectors' );

// TODO: get rid of tthis
export const getHappychatIsAvailable = createSelector(
	() => true
);

export const getHappychatConnectionStatus = createSelector(
	state => state.happychat.status,
	state => state.happychat.status
);

const fixLegacyEvent = event => {
	return isArray( event ) ? assign( {}, event[ 1 ], { message: event[ 0 ] } ) : event;
};

export const getHappychatTimeline = createSelector(
	state => {
		debug( 'convert timeline', state.happychat.timeline );
		return map( state.happychat.timeline, fixLegacyEvent );
	},
	state => map( map( state.happychat.timeline, fixLegacyEvent ), ( { id } ) => id )
);
