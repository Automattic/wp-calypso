/**
 * External dependencies
 */
import { expect } from 'chai';
import { match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	deleteSite,
	receiveDeletedSite,
	receiveSite,
	receiveSites,
	requestSites,
	requestSite,
} from '../actions';
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
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	const mySitesPath =
		'/rest/v1.1/me/sites?site_visibility=all&include_domain_only=true&site_activity=active';
	let sandbox, spy;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( '#receiveSite()', () => {
		test( 'should return an action object', () => {
			const site = { ID: 2916284, name: 'WordPress.com Example Blog' };
			const action = receiveSite( site );

			expect( action ).to.eql( {
				type: SITE_RECEIVE,
				site,
			} );
		} );
	} );
	describe( '#receiveSites()', () => {
		test( 'should return an action object', () => {
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

	describe( '#requestSites()', () => {
		describe( 'success', () => {
			useNock( ( nock ) => {
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

			test( 'should dispatch request action when thunk triggered', () => {
				requestSites()( spy );
				expect( spy ).to.have.been.calledWith( {
					type: SITES_REQUEST,
				} );
			} );
			test( 'should dispatch receive action when request completes', () => {
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
			test( 'should dispatch success action when request completes', () => {
				return requestSites()( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						type: SITES_REQUEST_SUCCESS,
					} );
				} );
			} );
		} );
		describe( 'failure', () => {
			useNock( ( nock ) => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.filteringPath( () => mySitesPath )
					.get( mySitesPath )
					.reply( 403, {
						error: 'authorization_required',
						message: 'An active access token must be used to access sites.',
					} );
			} );

			test( 'should dispatch fail action when request fails', () => {
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
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.2/sites/2916284' )
				.reply( 200, {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					capabilities: {},
				} )
				.get( '/rest/v1.2/sites/77203074' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} )
				.get( '/rest/v1.2/sites/8894098' )
				.reply( 200, {
					ID: 8894098,
					name: 'Some random site I dont have access to',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestSite( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_REQUEST,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch receive site when request completes', () => {
			return requestSite( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveSite( {
						ID: 2916284,
						name: 'WordPress.com Example Blog',
						capabilities: {},
					} )
				);
			} );
		} );

		test( "should not dispatch receive site when request completes with site we can't manage", () => {
			return requestSite( 8894098 )( spy ).then( () => {
				expect( spy ).to.have.not.been.calledWith(
					receiveSite( {
						ID: 8894098,
						name: 'WordPress.com Example Blog',
					} )
				);
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return requestSite( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_REQUEST_SUCCESS,
					siteId: 2916284,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestSite( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_REQUEST_FAILURE,
					siteId: 77203074,
					error: match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );

		test( "should not dispatch request success action when request completes with site we can't manage", () => {
			return requestSite( 8894098 )( spy ).then( () => {
				expect( spy ).to.have.not.been.calledWith( {
					type: SITE_REQUEST_SUCCESS,
					siteId: 8894098,
				} );
			} );
		} );
	} );

	describe( 'deleteSite()', () => {
		useNock( ( nock ) => {
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

		test( 'should dispatch delete action when thunk triggered', () => {
			deleteSite( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: SITE_DELETE,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch receive deleted site when request completes', () => {
			return deleteSite( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( receiveDeletedSite( 2916284 ) );
			} );
		} );

		test( 'should dispatch delete success action when request completes', () => {
			return deleteSite( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: SITE_DELETE_SUCCESS,
					siteId: 2916284,
				} );
			} );
		} );

		test( 'should dispatch fail action when request for delete fails', () => {
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
