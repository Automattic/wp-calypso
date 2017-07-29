/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveSites } from 'state/sites/actions';
import {
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Object holding query parameters for request all sites (exported for testing)
 */
export const SITES_REQUEST_QUERY_PARAMS = {
	site_visibility: 'all',
	include_domain_only: true,
	site_activity: 'active',
	fields: 'ID,URL,name,capabilities,jetpack,visible,is_private,is_vip,icon,plan,jetpack_modules,single_user_site,is_multisite,options', //eslint-disable-line max-len
	options: 'is_mapped_domain,unmapped_url,admin_url,is_redirect,is_automated_transfer,allowed_file_types,show_on_front,main_network_site,jetpack_version,software_version,default_post_format,created_at,frame_nonce,publicize_permanently_disabled,page_on_front,page_for_posts,advanced_seo_front_page_description,advanced_seo_title_formats,verification_services_codes,podcasting_archive,is_domain_only,default_sharing_status,default_likes_enabled,wordads,upgraded_filetypes_enabled,videopress_enabled,permalink_structure,gmt_offset' //eslint-disable-line max-len
};

/**
 * Dispatches a request to fetch all sites of the current user
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @returns {Object}            dispatched http action
 */
export const requestSites = ( { dispatch }, action ) => dispatch( http( {
	apiVersion: '1.1',
	method: 'GET',
	path: '/me/sites',
	query: SITES_REQUEST_QUERY_PARAMS
}, action ) );

/**
 * Dispatches an error action when the fetch all sites request fails
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Function} next     data-layer-bypassing dispatcher
 * @param   {Object}   error    object containing error information
 * @returns {Object}            dispatched error action
 */
export const receiveSitesError = ( { dispatch }, action, next, error ) => (
	dispatch( {
		type: SITES_REQUEST_FAILURE,
		error
	} )
);

/**
 * Dispatches required actions when the fetch all sites request succeeds
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Function} next     data-layer-bypassing dispatcher
 * @param   {Object}   response object containing the fetched site
 */
export const receiveSitesSuccess = ( { dispatch }, action, next, response ) => {
	dispatch( receiveSites( response.sites ) );
	dispatch( {
		type: SITES_REQUEST_SUCCESS
	} );
};

export default {
	[ SITES_REQUEST ]: [ dispatchRequest( requestSites, receiveSitesSuccess, receiveSitesError ) ],
};
