/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SHORTCODE_RECEIVE,
	SHORTCODE_REQUEST,
	SHORTCODE_REQUEST_FAILURE,
	SHORTCODE_REQUEST_SUCCESS
} from 'state/action-types';

export function fetchShortcode( siteId, shortcode ) {
	return ( dispatch ) => {
		dispatch( {
			type: SHORTCODE_REQUEST,
			siteId,
			shortcode
		} );

		return wpcom.undocumented().site( siteId ).shortcodes( { shortcode } ).then( ( data ) => {
			dispatch( {
				type: SHORTCODE_REQUEST_SUCCESS,
				siteId,
				shortcode
			} );

			dispatch( {
				type: SHORTCODE_RECEIVE,
				siteId,
				shortcode,
				data
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: SHORTCODE_REQUEST_FAILURE,
				siteId,
				shortcode,
				error
			} );
		} );
	};
}
