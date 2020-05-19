/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	receiveGuidedTransferStatus,
	requestGuidedTransferStatus,
	saveHostDetails,
} from '../actions';
import {
	GUIDED_TRANSFER_HOST_DETAILS_SAVE,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
	GUIDED_TRANSFER_STATUS_RECEIVE,
	GUIDED_TRANSFER_STATUS_REQUEST,
	GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
	GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	const sampleSiteId = 100658273;
	const sampleStatus = {
		issues: [],
		upgrade_purchased: true,
		host_details_entered: false,
	};

	const sampleSiteIdSave = 77203074;
	const sampleStatusSaved = {
		issues: [],
		upgrade_purchased: false,
		host_details_entered: true,
	};

	const sampleSiteIdFail = 77203199;

	describe( '#receiveGuidedTransferStatus()', () => {
		test( 'should return an action object', () => {
			const action = receiveGuidedTransferStatus( sampleSiteId, sampleStatus );

			expect( action ).to.eql( {
				type: GUIDED_TRANSFER_STATUS_RECEIVE,
				siteId: sampleSiteId,
				guidedTransferStatus: sampleStatus,
			} );
		} );
	} );

	describe( '#requestGuidedTransferStatus()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/wpcom/v2/sites/${ sampleSiteId }/transfer` )
				.reply( 200, sampleStatus )
				.get( `/wpcom/v2/sites/${ sampleSiteIdFail }/transfer` )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestGuidedTransferStatus( sampleSiteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: GUIDED_TRANSFER_STATUS_REQUEST,
				siteId: sampleSiteId,
			} );
		} );

		test( 'should dispatch success action when request completes', () => {
			return requestGuidedTransferStatus( sampleSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GUIDED_TRANSFER_STATUS_REQUEST_SUCCESS,
					siteId: sampleSiteId,
				} );
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return requestGuidedTransferStatus( sampleSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GUIDED_TRANSFER_STATUS_RECEIVE,
					siteId: sampleSiteId,
					guidedTransferStatus: sampleStatus,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestGuidedTransferStatus( sampleSiteIdFail )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GUIDED_TRANSFER_STATUS_REQUEST_FAILURE,
					siteId: sampleSiteIdFail,
					error: sinon.match( { message: 'A server error occurred' } ),
				} );
			} );
		} );
	} );

	describe( '#saveHostDetails()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( `/wpcom/v2/sites/${ sampleSiteId }/transfer` )
				.reply( 200, sampleStatus )
				.post( `/wpcom/v2/sites/${ sampleSiteIdSave }/transfer` )
				.reply( 200, sampleStatusSaved )
				.post( `/wpcom/v2/sites/${ sampleSiteIdFail }/transfer` )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		test( 'should dispatch save action when thunk triggered', () => {
			saveHostDetails( sampleSiteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: GUIDED_TRANSFER_HOST_DETAILS_SAVE,
				siteId: sampleSiteId,
			} );
		} );

		test( 'should dispatch success action when request completes', () => {
			return saveHostDetails( sampleSiteIdSave )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
					siteId: sampleSiteIdSave,
				} );
			} );
		} );

		test( 'should dispatch receive action for updated status when request completes', () => {
			return saveHostDetails( sampleSiteIdSave )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GUIDED_TRANSFER_STATUS_RECEIVE,
					siteId: sampleSiteIdSave,
					guidedTransferStatus: sampleStatusSaved,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return saveHostDetails( sampleSiteIdFail )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE,
					siteId: sampleSiteIdFail,
					error: sinon.match( { message: 'A server error occurred' } ),
				} );
			} );
		} );
	} );
} );
