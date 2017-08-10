/** @format */
/**
 * External dependencies
 */
import { match } from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_SUCCESS,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
	SITES_UPDATE,
} from 'state/action-types';
import {
	deleteSite,
	receiveDeletedSite,
	receiveSite,
	receiveSites,
	receiveSiteUpdates,
	requestSites,
	requestSite,
} from '../actions';

import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	const mySitesPath =
		'/rest/v1.1/me/sites?site_visibility=all&include_domain_only=true&site_activity=active';
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( '#receiveSite()', () => {
		it( 'should return an action object', () => {
			const site = { ID: 2916284, name: 'WordPress.com Example Blog' };
			const action = receiveSite( site );

			expect( action ).to.eql( {
				type: SITE_RECEIVE,
				site,
			} );
		} );
	} );
	describe( '#receiveSites()', () => {
		it( 'should return an action object', () => {
			const sites = [
				{ ID: 2916284, name: 'WordPress.com Example Blog' },
				{ ID: 77203074, name: 'WordPress.com Example Blog 2' },
			];
			const action = receiveSites( sites );
			expect( action ).to.eql( {
				type: SITES_RECEIVE,
				sites,
			} );
		} );
	} );

	describe( 'receiveSiteUpdates()', () => {
		it( 'should return an action object', () => {
			const sites = [ { ID: 2916284, name: 'WordPress.com Example Blog' } ];

			const action = receiveSiteUpdates( sites );

			expect( action ).to.eql( {
				type: SITES_UPDATE,
				sites,
			} );
		} );
	} );

	describe( '#requestSites()', () => {
		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.filteringPath( () => mySitesPath )
					.get( mySitesPath )
					.reply( 200, {
						sites: [
							{ ID: 2916284, name: 'WordPress.com Example Blog' },
							{ ID: 77203074, name: 'WordPress.com Example Blog 2' },
						],
					} );
			} );

			it( 'should dispatch request action when thunk triggered', () => {
				requestSites()( spy );
				expect( spy ).to.have.been.calledWith( {
					type: SITES_REQUEST,
				} );
			} );
			it( 'should dispatch receive action when request completes', () => {
				return requestSites()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITES_RECEIVE,
						sites: [
							{ ID: 2916284, name: 'WordPress.com Example Blog' },
							{ ID: 77203074, name: 'WordPress.com Example Blog 2' },
						],
					} );
				} );
			} );
			it( 'should dispatch success action when request completes', () => {
				return requestSites()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITES_REQUEST_SUCCESS,
					} );
				} );
			} );
		} );
		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.filteringPath( () => mySitesPath )
					.get( mySitesPath )
					.reply( 403, {
						error: 'authorization_required',
						message: 'An active access token must be used to access sites.',
					} );
			} );

			it( 'should dispatch fail action when request fails', () => {
				return requestSites()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITES_REQUEST_FAILURE,
						error: sandbox.match( {
							message: 'An active access token must be used to access sites.',
						} ),
					} );
				} );
			} );
		} );
	} );

	describe( 'requestSite()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284' )
				.reply( 200, {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
				} )
				.get( '/rest/v1.1/sites/77203074' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestSite( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_REQUEST,
				siteId: 2916284,
			} );
		} );

		it( 'should dispatch receive site when request completes', () => {
			return requestSite( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveSite( {
						ID: 2916284,
						name: 'WordPress.com Example Blog',
					} )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestSite( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_REQUEST_SUCCESS,
					siteId: 2916284,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestSite( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_REQUEST_FAILURE,
					siteId: 77203074,
					error: match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );

	describe( 'deleteSite()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/delete' )
				.reply( 200, {
					ID: 2916284,
				} )
				.post( '/rest/v1.1/sites/77203074/delete' )
				.reply( 403, {
					error: 'unauthorized',
					message: 'User cannot delete site.',
				} );
		} );

		it( 'should dispatch delete action when thunk triggered', () => {
			deleteSite( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_DELETE,
				siteId: 2916284,
			} );
		} );

		it( 'should dispatch receive deleted site when request completes', () => {
			return deleteSite( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( receiveDeletedSite( 2916284 ) );
			} );
		} );

		it( 'should dispatch delete success action when request completes', () => {
			return deleteSite( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_DELETE_SUCCESS,
					siteId: 2916284,
				} );
			} );
		} );

		it( 'should dispatch fail action when request for delete fails', () => {
			return deleteSite( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_DELETE_FAILURE,
					siteId: 77203074,
					error: match( { message: 'User cannot delete site.' } ),
				} );
			} );
		} );
	} );
} );
