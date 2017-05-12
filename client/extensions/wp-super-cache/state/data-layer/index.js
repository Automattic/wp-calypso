/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
  WP_SUPER_CACHE_TEST_CACHE,
  WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
} from '../action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice } from 'state/notices/actions';

const testCache = ( { dispatch }, action ) => {
	const { siteId, httpOnly } = action;
	dispatch( http( {
		method: 'POST',
		apiVersion: '1.2',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path: '/wp-super-cache/v1/cache/test',
			body: JSON.stringify( { httponly: httpOnly } ),
			json: true
		}
	}, action ) );
};

const receiveSuccess = ( { dispatch }, { siteId }, next, data ) => {
	dispatch( { type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS, siteId, results: data } );
	dispatch( successNotice( i18n.translate( 'Cache test completed successfully.' ) ) );
};

const receiveError = ( { dispatch } ) => {
	dispatch( errorNotice( i18n.translate( 'There was a problem testing the cache. Please try again.' ) ) );
};

const handlers = {
	[ WP_SUPER_CACHE_TEST_CACHE ]: [ dispatchRequest( testCache, receiveSuccess, receiveError ) ],
};

export default handlers;
