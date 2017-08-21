/**
 * Internal dependencies
 */
import {
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_SUCCESS,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
} from 'state/action-types';
import { receiveSite, receiveDeletedSite } from 'state/sites/actions';

import activity from './activity';
import automatedTransfer from './automated-transfer';
import blogStickers from './blog-stickers';
import comments from './comments';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import media from './media';
import { mergeHandlers } from 'state/action-watchers/utils';
import plugins from './plugins';
import posts from './posts';
import simplePayments from './simple-payments';

/**
 * Dispatches a request to delete a site
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @returns {Object}            dispatched http action
 */
export const deleteSite = ( { dispatch }, action ) => dispatch( http( {
	apiVersion: '1.1',
	method: 'POST',
	path: `/sites/${ action.siteId }/delete`,
}, action ) );

/**
 * Dispatches an error action when the delete site request fails
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Function} next     data-layer-bypassing dispatcher
 * @param   {Object}   error    object containing error information
 * @returns {Object}            dispatched error action
 */
export const deleteSiteError = ( { dispatch }, action, next, error ) => dispatch( {
	type: SITE_DELETE_FAILURE,
	siteId: action.siteId,
	error
} );

/**
 * Dispatches required actions when the delete site request succeeds
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 */
export const deleteSiteSuccess = ( { dispatch }, action ) => {
	dispatch( receiveDeletedSite( action.siteId ) );
	dispatch( {
		type: SITE_DELETE_SUCCESS,
		siteId: action.siteId
	} );
};

/**
 * Dispatches a request to fetch a site
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @returns {Object}            dispatched http action
 */
export const requestSite = ( { dispatch }, action ) => dispatch( http( {
	apiVersion: '1.1',
	method: 'GET',
	path: `/sites/${ action.siteId }`,
}, action ) );

/**
 * Dispatches an error action when the fetch site request fails
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Function} next     data-layer-bypassing dispatcher
 * @param   {Object}   error    object containing error information
 * @returns {Object}            dispatched error action
 */
export const receiveSiteError = ( { dispatch }, action, next, error ) => dispatch( {
	type: SITE_REQUEST_FAILURE,
	siteId: action.siteId,
	error
} );

/**
 * Dispatches required actions when the fetch site request succeeds
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Function} next     data-layer-bypassing dispatcher
 * @param   {Object}   response object containing the fetched site
 */
export const receiveSiteSuccess = ( { dispatch }, action, next, response ) => {
	dispatch( receiveSite( response ) );
	dispatch( {
		type: SITE_REQUEST_SUCCESS,
		siteId: action.siteId
	} );
};

const siteHandlers = {
	[ SITE_DELETE ]: [ dispatchRequest( deleteSite, deleteSiteSuccess, deleteSiteError ) ],
	[ SITE_REQUEST ]: [ dispatchRequest( requestSite, receiveSiteSuccess, receiveSiteError ) ],
};

export default mergeHandlers(
	activity,
	automatedTransfer,
	blogStickers,
	comments,
	media,
	plugins,
	posts,
	simplePayments,
	siteHandlers
);
