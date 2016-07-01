/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	GUIDED_TRANSFER_STATUS_RECEIVE,
	GUIDED_TRANSFER_STATUS_REQUEST,
	GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
} from 'state/action-types';
import {
	receiveGuidedTransferStatus,
	requestGuidedTransferStatus,
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	const sampleSiteId = 100658273;
	const sampleStatus = {
		upgrade_purchased: true,
		host_details_entered: false,
	};

	describe( '#receiveProductsList()', () => {
		it( 'should return an action object', () => {
			const action = receiveGuidedTransferStatus( sampleSiteId, sampleStatus );

			expect( action ).to.eql( {
				type: GUIDED_TRANSFER_STATUS_RECEIVE,
				siteId: sampleSiteId,
				guidedTransferStatus: sampleStatus,
			} );
		} );
	} );

	describe( '#requestProductsList()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( `/rest/v1.1/sites/${sampleSiteId}/guided-transfer` )
				.twice().reply( 200, sampleStatus )
				.get( `/rest/v1.1/sites/${sampleSiteId}/guided-transfer` )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestGuidedTransferStatus( sampleSiteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: GUIDED_TRANSFER_STATUS_REQUEST,
				siteId: sampleSiteId
			} );
		} );

		it( 'should dispatch product list receive action when request completes', () => {
			return requestGuidedTransferStatus( sampleSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GUIDED_TRANSFER_STATUS_RECEIVE,
					siteId: sampleSiteId,
					guidedTransferStatus: sampleStatus,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestGuidedTransferStatus( sampleSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
					siteId: sampleSiteId,
					error: sinon.match( { message: 'A server error occurred' } )
				} );
			} );
		} );
	} );
} );
