/**
 * Internal dependencies
 */
import { ActionTypes } from './constants';
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

/**
 * Given a site ID and shortcode text, triggers a request to the REST API
 * shortcodes render endpoint. Immediately dispatches a `FETCH_SHORTCODE`
 * action, followed by a `RECEIVE_SHORTCODE` action after the request has
 * completed.
 *
 * @param {Number} siteId    Site ID for which to render the shortcode
 * @param {String} shortcode Shortcode text to be rendered
 */
export function fetch( siteId, shortcode ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.FETCH_SHORTCODE,
		payload: { siteId, shortcode }
	} );

	wpcom.undocumented().site( siteId ).shortcodes( { shortcode }, ( error, data ) => {
		Dispatcher.handleServerAction( {
			type: ActionTypes.RECEIVE_SHORTCODE,
			payload: { siteId, shortcode, data },
			error: error
		} );
	} );
}
