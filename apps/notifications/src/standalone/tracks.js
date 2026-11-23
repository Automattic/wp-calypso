import { addTracksSurface, recordTracksEvent } from '../panel/helpers/stats';

let userIdentified = Promise.resolve();

/**
 * Names the panel on WordPress.com pages as the surface of every event the iframe records, and tells Tracks who the user is.
 * @param {Object} wpcom The REST client.
 */
export const initTracks = ( wpcom ) => {
	addTracksSurface( 'wpcom_panel' );

	userIdentified = wpcom.req
		.get( '/me', { fields: 'ID,username' } )
		.then( ( { ID, username } ) => {
			window._tkq = window._tkq || [];
			window._tkq.push( [ 'identifyUser', ID, username ] );
		} )
		.catch( () => {} );
};

/**
 * Records that the host opened the panel. Waits until Tracks knows the user, because the host can open the panel as soon as the iframe has loaded.
 * @returns {Promise<void>} Resolves once the event is recorded.
 */
export const recordPanelOpen = () =>
	userIdentified.then( () => recordTracksEvent( 'calypso_notification_open' ) );
