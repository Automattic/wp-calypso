/** @format */

/**
 * Internal dependencies
 */

import {
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
} from 'state/action-types';
import wp from 'lib/wp';

/**
 * Regenerate the target email of Post by Email.
 *
 * @param  {Int}      siteId      ID of the site.
 * @return {Function}             Action thunk to regenerate the email when called.
 */
export const regeneratePostByEmail = siteId => {
	return dispatch => {
		dispatch( {
			type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
			siteId,
		} );

		return wp
			.undocumented()
			.updateJetpackSettings( siteId, { post_by_email_address: 'regenerate' } )
			.then( ( { data } ) => {
				dispatch( {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
					siteId,
					email: data.post_by_email_address,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
					siteId,
					error: error.message,
				} );
			} );
	};
};
