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

export const getHappychatConnectionStatus = createSelector(
	state => state.happychat.status,
	state => state.happychat.status
);

const fixLegacyEvent = event => {
	return isArray( event ) ? assign( {}, event[ 1 ], { message: event[ 0 ] } ) : event;
};

export const getHappychatTimeline = createSelector(
	state => map( state.happychat.timeline, fixLegacyEvent ),
	state => map( map( state.happychat.timeline, fixLegacyEvent ), ( { id } ) => id )
);
