/** @format */

/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import schema from './schema';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { normalizeSettings } from 'state/site-settings/utils';
import { receiveSiteSettings } from 'state/site-settings/actions';
import { SITE_SETTINGS_REQUEST } from 'state/action-types';

/**
 * Dispatches a request to fetch connected applications of the current user
 *
 * @param   {Object} action Redux action
 * @returns {Object} Dispatched http action
 */
function requestSiteSettings( action ) {
	return http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: `/sites/${ action.siteId }/settings`,
		},
		action
	);
}

function handleSuccess( action, data ) {
	return receiveSiteSettings( action.siteId, data );
}

function transformer( data ) {
	const { name, description, settings } = data;

	return {
		...normalizeSettings( settings ),
		blogname: name,
		blogdescription: description,
	};
}

export default {
	[ SITE_SETTINGS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestSiteSettings,
			onSuccess: handleSuccess,
			fromApi: makeJsonSchemaParser( schema, transformer ),
		} ),
	],
};
