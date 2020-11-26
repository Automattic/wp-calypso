/**
 *  External dependencies
 */
import { invoke } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { READER_ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';

const eventServices = {
	tracks: ( { name, properties } ) => recordTracksEvent( name, properties ),
};

const dispatcher = ( action ) => {
	const analyticsMeta = action.meta.analytics;
	analyticsMeta.forEach( ( { type, payload } ) => {
		const { service = 'tracks', ...params } = payload;

		switch ( type ) {
			case READER_ANALYTICS_EVENT_RECORD:
				return invoke( eventServices, service, params );
		}
	} );
};

export const readerAnalyticsMiddleware = ( store ) => ( next ) => ( action ) => {
	switch ( action.type ) {
		case READER_ANALYTICS_EVENT_RECORD:
			console.log( store.getState() );
			dispatcher( action );
			return;
	}

	return next( action );
};

export default readerAnalyticsMiddleware;
