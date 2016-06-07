/**
 * External dependencies
 */
import { expect } from 'chai';
import nock from 'nock';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import {
	WORDADS_SITE_APPROVE_REQUEST,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_FAILURE,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS
} from 'state/action-types';

import { useSandbox } from 'test/helpers/use-sinon';
import useMockery from 'test/helpers/use-mockery';

describe( 'actions', () => {
	let sandbox, spy, requestWordAdsApproval, dismissWordAdsError, dismissWordAdsSuccess;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/sites-list', function() {
			return { getSite: noop };
		} );
		const actions = require( '../actions' );
		requestWordAdsApproval = actions.requestWordAdsApproval;
		dismissWordAdsError = actions.dismissWordAdsError;
		dismissWordAdsSuccess = actions.dismissWordAdsSuccess;
	} );

	describe( '#dismissWordAdsError()', () => {
		it( 'should return a dismiss error action', () => {
			expect( dismissWordAdsError( 2916284 ) ).to.eql( {
				type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
				siteId: 2916284
			} );
		} );
	} );

	describe( '#dismissWordAdsSuccess()', () => {
		it( 'should return a dismiss Success action', () => {
			expect( dismissWordAdsSuccess( 2916284 ) ).to.eql( {
				type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
				siteId: 2916284
			} );
		} );
	} );

	describe( '#requestWordAdsApproval()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/wordads/approve' )
				.reply( 200, {
					approved: true
				} )
				.post( '/rest/v1.1/sites/77203074/wordads/approve' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'An active access token must be used to approve wordads.'
				} );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestWordAdsApproval( 2916284 )( spy );
			expect( spy ).to.have.been.calledWith( {
				type: WORDADS_SITE_APPROVE_REQUEST,
				siteId: 2916284
			} );
		} );

		it( 'should dispatch success action when request completes', () => {
			return requestWordAdsApproval( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
					approved: true,
					siteId: 2916284
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestWordAdsApproval( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
					siteId: 77203074,
					error: sandbox.match( 'An active access token must be used to approve wordads.' )
				} );
			} );
		} );
	} );
} );
