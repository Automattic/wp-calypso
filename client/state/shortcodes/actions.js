/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SHORTCODE_FETCH,
	SHORTCODE_RECEIVE
} from 'state/action-types';

export function fetchShortcode( siteId, shortcode ) {
	return ( dispatch ) => {
		dispatch( {
			type: SHORTCODE_FETCH,
			siteId,
			shortcode
		} );

		return wpcom.undocumented().site( siteId ).shortcodes( { shortcode } ).then( ( data ) => {
			dispatch( {
				type: SHORTCODE_RECEIVE,
				siteId,
				shortcode,
				data,
				error: null
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: SHORTCODE_RECEIVE,
				siteId,
				shortcode,
				data: null,
				error
			} );
		} );
	};
}
