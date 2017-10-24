/**
 * Internal dependencies
 */
import {
	OPTIONS_RECEIVE,
	OPTIONS_REQUEST,
	OPTIONS_REQUEST_FAILURE,
	OPTIONS_REQUEST_SUCCESS,
} from './action-types';
import { fetchSiteOptions } from '../lib';

/**
 * Fetch the Jetpack settings for a certain site.
 *
 * @param  {Int}      siteId      ID of the site.
 * @return {Function}             Action thunk to fetch the Jetpack settings when called.
 */
export const fetchOptions = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: OPTIONS_REQUEST,
			siteId
		} );

		return fetchSiteOptions( siteId )
			.then( ( response ) => {
				const settings = response.data;
				dispatch( {
					type: OPTIONS_RECEIVE,
					siteId,
					settings
				} );
				dispatch( {
					type: OPTIONS_REQUEST_SUCCESS,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: OPTIONS_REQUEST_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};
