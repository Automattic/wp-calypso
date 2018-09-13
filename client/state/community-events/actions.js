/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	COMMUNITY_EVENTS_RECEIVE,
	COMMUNITY_EVENTS_REQUEST,
	COMMUNITY_EVENTS_REQUEST_FAILURE,
} from 'state/action-types';
import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:community-events:actions' );

/**
 * Action creator to receive events array
 *
 * @param {Object} events array
 * @returns {Object} action object
 */
export const communityEventsReceive = events => ( {
	type: COMMUNITY_EVENTS_RECEIVE,
	...events,
} );

/**
 * Action creator to request local community events
 *
 * @return {Object} action object
 */
export const requestCommunityEvents = () => {
	return dispatch => {
		dispatch( { type: COMMUNITY_EVENTS_REQUEST } );

		return wpcom
			.undocumented()
			.getCommunityEvents()
			.then( data => {
				dispatch( communityEventsReceive( data ) );
			} )
			.catch( error => {
				debug( 'Fetching community events failed: ', error );
				const errorMessage =
					error.message ||
					i18n.translate(
						'There was a problem fetching community events. Please try again later or contact support.'
					);
				dispatch( {
					type: COMMUNITY_EVENTS_REQUEST_FAILURE,
					error: errorMessage,
				} );
			} );
	};
};
