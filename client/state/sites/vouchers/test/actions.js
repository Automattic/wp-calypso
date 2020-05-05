/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	vouchersAssignReceiveAction,
	vouchersAssignRequestAction,
	vouchersAssignRequestSuccessAction,
	vouchersAssignRequestFailureAction,
	vouchersReceiveAction,
	vouchersRequestAction,
	vouchersRequestSuccessAction,
	vouchersRequestFailureAction,
	assignSiteVoucher,
	requestSiteVouchers,
} from '../actions';
import {
	SITE_ID_0 as siteId,
	REST_API_RESPONSE as wpcomResponse,
	REST_API_ASSIGN_VOUCHER_RESPONSE as wpcomAssignResponse,
	REST_API_ERROR_RESPONSE as wpcomErrorResponse,
	ERROR_RESPONSE as errorResponse,
	SERVICE_TYPE as oneOfOurServiceTypes,
} from './fixture';
import {
	SITE_VOUCHERS_ASSIGN_RECEIVE,
	SITE_VOUCHERS_ASSIGN_REQUEST,
	SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS,
	SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE,
	SITE_VOUCHERS_RECEIVE,
	SITE_VOUCHERS_REQUEST,
	SITE_VOUCHERS_REQUEST_SUCCESS,
	SITE_VOUCHERS_REQUEST_FAILURE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	describe( 'Actions creators', () => {
		test( '#vouchersReceiveAction()', () => {
			const { vouchers } = wpcomAssignResponse;
			const action = vouchersReceiveAction( siteId, vouchers );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_RECEIVE,
				siteId,
				vouchers,
			} );
		} );

		test( '#vouchersRequestAction()', () => {
			const action = vouchersRequestAction( siteId );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_REQUEST,
				siteId,
			} );
		} );

		test( '#vouchersRequestSuccessAction()', () => {
			const action = vouchersRequestSuccessAction( siteId );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_REQUEST_SUCCESS,
				siteId,
			} );
		} );

		test( '#vouchersRequestFailureAction()', () => {
			const action = vouchersRequestFailureAction( siteId, errorResponse );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_REQUEST_FAILURE,
				siteId,
				error: errorResponse,
			} );
		} );

		test( '#vouchersAssignReceiveAction()', () => {
			const { voucher } = wpcomResponse;

			const action = vouchersAssignReceiveAction( siteId, oneOfOurServiceTypes, voucher );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_ASSIGN_RECEIVE,
				siteId,
				serviceType: oneOfOurServiceTypes,
				voucher,
			} );
		} );

		test( '#vouchersAssignRequestAction()', () => {
			const action = vouchersAssignRequestAction( siteId, oneOfOurServiceTypes );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_ASSIGN_REQUEST,
				siteId,
				serviceType: oneOfOurServiceTypes,
			} );
		} );

		test( '#vouchersAssignRequestSuccessAction()', () => {
			const action = vouchersAssignRequestSuccessAction( siteId, oneOfOurServiceTypes );
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS,
				siteId,
				serviceType: oneOfOurServiceTypes,
			} );
		} );

		test( '#vouchersAssignRequestFailureAction()', () => {
			const action = vouchersAssignRequestFailureAction(
				siteId,
				oneOfOurServiceTypes,
				errorResponse
			);
			expect( action ).to.eql( {
				type: SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE,
				siteId,
				serviceType: oneOfOurServiceTypes,
				error: errorResponse,
			} );
		} );
	} );

	describe( '#requestSiteVouchers() - success', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/wpcom/v2/sites/${ siteId }/vouchers` )
				.reply( 200, wpcomResponse );
		} );

		test( 'should dispatch REQUEST action when thunk triggered', () => {
			const action = vouchersRequestAction( siteId );
			requestSiteVouchers( siteId )( spy );
			expect( spy ).to.have.been.calledWith( action );
		} );

		test( 'should dispatch RECEIVE action when request completes', () => {
			const { vouchers } = wpcomResponse;
			const action = vouchersReceiveAction( siteId, vouchers );

			return requestSiteVouchers( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( action );
			} );
		} );
	} );

	describe( '#assignSiteVoucher() - success', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/wpcom/v2/sites/${ siteId }/vouchers/${ oneOfOurServiceTypes }/assign` )
				.reply( 200, wpcomAssignResponse );
		} );

		test( 'should dispatch REQUEST action when thunk triggered', () => {
			const action = vouchersAssignRequestAction( siteId, oneOfOurServiceTypes );
			assignSiteVoucher( siteId, oneOfOurServiceTypes )( spy );
			expect( spy ).to.have.been.calledWith( action );
		} );

		test( 'should dispatch RECEIVE action when request completes', () => {
			const { voucher } = wpcomAssignResponse;
			const action = vouchersAssignRequestAction( siteId, oneOfOurServiceTypes, voucher );

			return assignSiteVoucher(
				siteId,
				oneOfOurServiceTypes
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( action );
			} );
		} );
	} );

	describe( '#requestSiteVouchers() - failure', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/wpcom/v2/sites/${ siteId }/vouchers` )
				.reply( 403, wpcomErrorResponse );
		} );

		test( 'should dispatch REQUEST_FAILURE action when request failed', () => {
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

	describe( '#assignSiteVoucher() - failure', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/wpcom/v2/sites/${ siteId }/vouchers/${ oneOfOurServiceTypes }/assign` )
				.reply( 403, wpcomErrorResponse );
		} );

		test( 'should dispatch assign_FAILURE action when assign failed', () => {
			const { message } = wpcomErrorResponse;
			const assignAction = vouchersAssignRequestAction( siteId, oneOfOurServiceTypes );
			const failureAction = vouchersAssignRequestFailureAction(
				siteId,
				oneOfOurServiceTypes,
				message
			);

			const promise = assignSiteVoucher( siteId, oneOfOurServiceTypes )( spy );
			expect( spy ).to.have.been.calledWith( assignAction );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( failureAction );
			} );
		} );
	} );
} );
