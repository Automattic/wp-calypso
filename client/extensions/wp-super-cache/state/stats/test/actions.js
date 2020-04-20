/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WP_SUPER_CACHE_DELETE_FILE,
	WP_SUPER_CACHE_DELETE_FILE_FAILURE,
	WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
	WP_SUPER_CACHE_GENERATE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
	WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
} from '../../action-types';
import { deleteFile, generateStats } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	const siteId = 123456;
	const failedSiteId = 456789;
	const url = 'wordpress.com/test';
	const stats = {
		data: {
			generated: 1493997829,
			supercache: {
				cached: 1,
				cached_list: [
					{
						lower_age: 180347,
						files: 2,
						upper_age: 183839,
						dir: 'wordpress.com/test',
					},
				],
				expired: 0,
				expired_list: [],
				fsize: 59573,
			},
			wpcache: {
				cached: 0,
				cached_list: [],
				expired: 1,
				expired_list: [
					{
						lower_age: 180347,
						files: 2,
						upper_age: 183839,
						dir: 'wordpress.com/test',
					},
				],
				fsize: 59573,
			},
		},
	};

	describe( '#generateStats()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/stats' } )
				.reply( 200, stats )
				.get( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/stats' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			generateStats( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_GENERATE_STATS,
				siteId,
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return generateStats( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
					stats: stats.data,
					siteId,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return generateStats( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
					siteId: failedSiteId,
				} );
			} );
		} );
	} );

	describe( '#deleteFile()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/`, {
					path: '/wp-super-cache/v1/cache',
					body: JSON.stringify( { url } ),
					json: true,
				} )
				.reply( 200, { 'Cache Cleared': true } )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/`, {
					path: '/wp-super-cache/v1/cache',
					json: true,
				} )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			deleteFile( siteId, url, true, false )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_DELETE_FILE,
				siteId,
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return deleteFile(
				siteId,
				url,
				true,
				false
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
					isSupercache: true,
					isCached: false,
					siteId,
					url,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return deleteFile(
				failedSiteId,
				url,
				true,
				false
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_DELETE_FILE_FAILURE,
					siteId: failedSiteId,
				} );
			} );
		} );
	} );
} );
