/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	domainsReceiveAction,
	domainsRequestAction,
	domainsRequestSuccessAction,
	domainsRequestFailureAction,
	fetchSiteDomains,
} from '../actions';
import {
	SITE_ID_FIRST as siteId,
	REST_API_RESPONSE as wpcomResponse,
	REST_API_ERROR_RESPONSE as wpcomErrorResponse,
	ACTION_SITE_DOMAIN_RECEIVE,
	ACTION_SITE_DOMAIN_REQUEST,
	ACTION_SITE_DOMAIN_REQUEST_SUCCESS,
	ACTION_SITE_DOMAIN_REQUEST_FAILURE,
	ERROR_MESSAGE_RESPONSE as errorResponse,
} from './fixture';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( 'Actions creators', () => {
		test( '#domainsReceiveAction()', () => {
			const { domains } = wpcomResponse;
			const action = domainsReceiveAction( siteId, domains );
			expect( action ).to.eql( ACTION_SITE_DOMAIN_RECEIVE );
		} );

		test( '#domainsRequestAction()', () => {
			const action = domainsRequestAction( siteId );
			expect( action ).to.eql( ACTION_SITE_DOMAIN_REQUEST );
		} );

		test( '#domainsRequestSuccessAction()', () => {
			const action = domainsRequestSuccessAction( siteId );
			expect( action ).to.eql( ACTION_SITE_DOMAIN_REQUEST_SUCCESS );
		} );

		test( '#domainsRequestFailureAction()', () => {
			const action = domainsRequestFailureAction( siteId, errorResponse );
			expect( action ).to.eql( ACTION_SITE_DOMAIN_REQUEST_FAILURE );
		} );
	} );

	describe( '#fetchSiteDomains() - success', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.2/sites/${ siteId }/domains` )
				.reply( 200, wpcomResponse );
		} );

		test( 'should dispatch REQUEST action when thunk triggered', () => {
			const action = domainsRequestAction( siteId );
			fetchSiteDomains( siteId )( spy );
			expect( spy ).to.have.been.calledWith( action );
		} );

		test( 'should dispatch RECEIVE action when request completes', () => {
			const { domains } = wpcomResponse;
			const action = domainsReceiveAction( siteId, domains );

			return fetchSiteDomains( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( action );
			} );
		} );
	} );

	describe( '#fetchSiteDomains() - failure', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.2/sites/${ siteId }/domains` )
				.reply( 403, wpcomErrorResponse );
		} );

		test( 'should dispatch REQUEST_FAILURE action when request failed', () => {
			const { message } = wpcomErrorResponse;
			const requestAction = domainsRequestAction( siteId );
			const failureAction = domainsRequestFailureAction( siteId, message );

			const promise = fetchSiteDomains( siteId )( spy );
			expect( spy ).to.have.been.calledWith( requestAction );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( failureAction );
			} );
		} );
	} );
} );
