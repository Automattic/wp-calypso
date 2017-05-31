/**
 * Internal dependencies
 */
import {
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_REQUEST_FAILURE,
	SITE_SETTINGS_REQUEST_SUCCESS,
} from 'state/action-types';
import { receiveSiteSettings } from 'state/site-settings/actions';
import { normalizeSettings } from 'state/site-settings/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

/**
 * Normalize data from the REST API.
 *
 * @param {Object} data REST-API response
 * @return {Object}     normalized settings.
 */
function fromApi( { name, description, settings } ) {
	return {
		...normalizeSettings( settings ),
		blogname: name,
		blogdescription: description,
	};
}

export const fetchSiteSettings = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/settings`,
				apiVersion: '1.1',
			},
			action
		)
	);
};

export const replaceSiteSettings = ( { dispatch }, action, next, data ) => {
	const { siteId } = action;
	dispatch( receiveSiteSettings( siteId, fromApi( data ) ) );
	dispatch( {
		type: SITE_SETTINGS_REQUEST_SUCCESS,
		siteId,
	} );
};

export const announceFetchFailure = ( { dispatch }, { siteId, meta } ) => {
	dispatch( {
		type: SITE_SETTINGS_REQUEST_FAILURE,
		siteId,
		error: meta.dataLayer.error,
	} );
};

export default {
	[ SITE_SETTINGS_REQUEST ]: [
		dispatchRequest( fetchSiteSettings, replaceSiteSettings, announceFetchFailure ),
	],
};
