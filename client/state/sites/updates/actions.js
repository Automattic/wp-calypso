/** @format */

/**
 * Internal dependencies
 */

import {
	SITE_WORDPRESS_UPDATE_REQUEST,
	SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
	SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
	SITE_PLUGIN_UPDATED,
} from 'state/action-types';
import wpcom from 'lib/wp';

export const updateWordPress = siteId => {
	return dispatch => {
		dispatch( {
			type: SITE_WORDPRESS_UPDATE_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.updateWordPressCore( siteId )
			.then( () => {
				dispatch( {
					type: SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};

export const sitePluginUpdated = siteId => ( {
	type: SITE_PLUGIN_UPDATED,
	siteId,
} );
