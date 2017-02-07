/**
 * Internal dependencies
 */
import sa from 'superagent';

/**
 * External dependencies
 */
import Hashes from 'jshashes';

/**
 * Internal dependencies
 */
/*import {
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
} from 'state/action-types';*/

export const getGravatarInfo = ( email ) => {
	return () => {
		const md5email = ( new Hashes.MD5 ).hex( email );
		const url = 'https://en.gravatar.com/' + md5email + '.json';
		sa
			.get( url )
			.end( function( err, data ) {
				console.log( err, data.body );
			} );

		console.log(md5email);
		return;
	};
};
