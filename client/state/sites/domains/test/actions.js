/**
 * External dependencies
 */
import { expect } from 'chai';
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	domainsReceiveAction,
	domainsRequestAction,
	domainsRequestSuccessAction,
	domainsRequestFailureAction,
	fetchSiteDomains
} from '../actions';

import { useSandbox } from 'test/helpers/use-sinon';

/**
 * Fixture data
 */
import {
	SITE_ID_FIRST as siteId,
	REST_API_RESPONSE as wpcomResponse,
	REST_API_ERROR_RESPONSE as wpcomErrorResponse,
	ACTION_SITE_DOMAIN_RECEIVE,
	ACTION_SITE_DOMAIN_REQUEST,
	ACTION_SITE_DOMAIN_REQUEST_SUCCESS,
	ACTION_SITE_DOMAIN_REQUEST_FAILURE,
	ERROR_MESSAGE_RESPONSE as errorResponse
} from './fixture';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( 'Actions creators', () => {
		it( '#domainsReceiveAction()', () => {
			const { domains } = wpcomResponse;
			const action = domainsReceiveAction( siteId, domains );
			expect( action ).to.eql( ACTION_SITE_DOMAIN_RECEIVE );
		} );

		it( '#domainsRequestAction()', () => {
			const action = domainsRequestAction( siteId );
			expect( action ).to.eql( ACTION_SITE_DOMAIN_REQUEST );
		} );

		it( '#domainsRequestSuccessAction()', () => {
			const action = domainsRequestSuccessAction( siteId );
			expect( action ).to.eql( ACTION_SITE_DOMAIN_REQUEST_SUCCESS );
		} );

		it( '#domainsRequestFailureAction()', () => {
			const action = domainsRequestFailureAction( siteId, errorResponse );
			expect( action ).to.eql( ACTION_SITE_DOMAIN_REQUEST_FAILURE );
		} );
	} );

	describe( '#fetchSiteDomains() - success', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ siteId }/domains` )
				.reply( 200, wpcomResponse );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch REQUEST action when thunk triggered', () => {
			const action = domainsRequestAction( siteId );
			fetchSiteDomains( siteId )( spy );
			expect( spy ).to.have.been.calledWith( action );
		} );

		it( 'should dispatch RECEIVE action when request completes', () => {
			const { domains } = wpcomResponse;
			const action = domainsReceiveAction( siteId, domains );

			return fetchSiteDomains( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( action );
			} );
		} );
	} );

	describe( '#fetchSiteDomains() - failure', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ siteId }/domains` )
				.reply( 403, wpcomErrorResponse );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch REQUEST_FAILURE action when request failed', () => {
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
