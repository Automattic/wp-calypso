/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { dismissWordAdsError, dismissWordAdsSuccess, requestWordAdsApproval } from '../actions';
import {
	WORDADS_SITE_APPROVE_REQUEST,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_FAILURE,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
} from 'client/state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( '#dismissWordAdsError()', () => {
		test( 'should return a dismiss error action', () => {
			expect( dismissWordAdsError( 2916284 ) ).to.eql( {
				type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
				siteId: 2916284,
			} );
		} );
	} );

	describe( '#dismissWordAdsSuccess()', () => {
		test( 'should return a dismiss Success action', () => {
			expect( dismissWordAdsSuccess( 2916284 ) ).to.eql( {
				type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
				siteId: 2916284,
			} );
		} );
	} );

	describe( '#requestWordAdsApproval()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/sites/2916284/wordads/approve' )
				.reply( 200, {
					approved: true,
				} )
				.post( '/rest/v1.1/sites/77203074/wordads/approve' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'An active access token must be used to approve wordads.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestWordAdsApproval( 2916284 )( spy );
			expect( spy ).to.have.been.calledWith( {
				type: WORDADS_SITE_APPROVE_REQUEST,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch success action when request completes', () => {
			return requestWordAdsApproval( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
					approved: true,
					siteId: 2916284,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestWordAdsApproval( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
					siteId: 77203074,
					error: sandbox.match( 'An active access token must be used to approve wordads.' ),
				} );
			} );
		} );
	} );
} );
