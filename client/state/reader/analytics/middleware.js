/**
 *  External dependencies
 */
import { invoke } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { READER_ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';
import { getReaderFollowsCount } from 'calypso/state/reader/follows/selectors';

const eventServices = {
	tracks: ( { name, properties } ) => recordTracksEvent( name, properties ),
};

const dispatcher = ( action ) => {
	const analyticsMeta = action.meta.analytics;
	const followsCount = action.meta.followsCount;

	analyticsMeta.forEach( ( { type, payload } ) => {
		const { service = 'tracks', ...params } = payload;
		if ( followsCount ) {
			params.properties = Object.assign( { subscription_count: followsCount }, params.properties );
		}

		switch ( type ) {
			case READER_ANALYTICS_EVENT_RECORD:
				return invoke( eventServices, service, params );
		}
	} );
};

export const readerAnalyticsMiddleware = ( store ) => ( next ) => ( action ) => {
	switch ( action.type ) {
		case READER_ANALYTICS_EVENT_RECORD:
			action.meta.followsCount = getReaderFollowsCount( store.getState() );
			dispatcher( action );
			return;
	}

	return next( action );
};

export default readerAnalyticsMiddleware;
