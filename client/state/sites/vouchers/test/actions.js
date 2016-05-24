/**
 * External dependencies
 */
import { expect } from 'chai';
import nock from 'nock';

/**
 * Action types
 */
import {
	SITE_VOUCHERS_RECEIVE,
	SITE_VOUCHERS_REQUEST,
	SITE_VOUCHERS_REQUEST_SUCCESS,
	SITE_VOUCHERS_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Actions
 */
import {
	vouchersReceiveAction,
	vouchersRequestAction,
	vouchersRequestSuccessAction,
	vouchersRequestFailureAction,
	requestSiteVouchers
} from '../actions';

import { useSandbox } from 'test/helpers/use-sinon';

/**
 * Fixture data
 */
import {
	SITE_ID_0 as siteId,
	REST_API_RESPONSE as wpcomResponse,
	REST_API_ERROR_RESPONSE as wpcomErrorResponse,
	ERROR_MESSAGE_RESPONSE as errorResponse,
} from './fixture';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( 'Actions creators', () => {
		it( '#vouchersReceiveAction()', () => {
			const { vouchers } = wpcomResponse;
			const action = vouchersReceiveAction( siteId, vouchers );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_RECEIVE,
				siteId,
				vouchers
			} );
		} );

		it( '#vouchersRequestAction()', () => {
			const action = vouchersRequestAction( siteId );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_REQUEST,
				siteId
			} );
		} );

		it( '#vouchersRequestSuccessAction()', () => {
			const action = vouchersRequestSuccessAction( siteId );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_REQUEST_SUCCESS,
				siteId
			} );
		} );

		it( '#vouchersRequestFailureAction()', () => {
			const action = vouchersRequestFailureAction( siteId, errorResponse );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_REQUEST_FAILURE,
				siteId,
				error: errorResponse
			} );
		} );
	} );

	describe( '#requestSiteVouchers() - success', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/wpcom/v2/sites/${ siteId }/vouchers` )
				.reply( 200, wpcomResponse );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch REQUEST action when thunk triggered', () => {
			const action = vouchersRequestAction( siteId );
			requestSiteVouchers( siteId )( spy );
			expect( spy ).to.have.been.calledWith( action );
		} );

		it( 'should dispatch RECEIVE action when request completes', () => {
			const { vouchers } = wpcomResponse;
			const action = vouchersReceiveAction( siteId, vouchers );

			return requestSiteVouchers( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( action );
			} );
		} );
	} );

	describe( '#requestSiteVouchers() - failure', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/wpcom/v2/sites/${ siteId }/vouchers` )
				.reply( 403, wpcomErrorResponse );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch REQUEST_FAILURE action when request failed', () => {
			const { message } = wpcomErrorResponse;
			const requestAction = vouchersRequestAction( siteId );
			const failureAction = vouchersRequestFailureAction( siteId, message );

			const promise = requestSiteVouchers( siteId )( spy );
			expect( spy ).to.have.been.calledWith( requestAction );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( failureAction );
			} );
		} );
	} );
} );
