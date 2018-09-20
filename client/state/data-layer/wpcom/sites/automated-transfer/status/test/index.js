/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { requestStatus, receiveStatus } from '../';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	fetchAutomatedTransferStatus,
	setAutomatedTransferStatus,
} from 'state/automated-transfer/actions';
import { useFakeTimers } from 'test/helpers/use-sinon';

const siteId = 1916284;

const COMPLETE_RESPONSE = {
	blog_id: 1916284,
	status: 'complete',
	uploaded_plugin_slug: 'hello-dolly',
	transfer_id: 1,
};

const IN_PROGRESS_RESPONSE = {
	blog_id: 1916284,
	status: 'uploading',
	uploaded_plugin_slug: 'hello-dolly',
};

describe( 'requestStatus', () => {
	test( 'should dispatch an http request', () => {
		const dispatch = sinon.spy();
		requestStatus( { dispatch }, { siteId } );
		expect( dispatch ).to.have.been.calledWithMatch( {
			method: 'GET',
			path: `/sites/${ siteId }/automated-transfers/status`,
		} );
	} );
} );

describe( 'receiveStatus', () => {
	let clock;
	useFakeTimers( fakeClock => ( clock = fakeClock ) );

	test( 'should dispatch set status action', () => {
		const dispatch = sinon.spy();
		receiveStatus( { dispatch }, { siteId }, COMPLETE_RESPONSE );
		expect( dispatch ).to.have.callCount( 3 );
		expect( dispatch ).to.have.been.calledWith(
			setAutomatedTransferStatus( siteId, 'complete', 'hello-dolly' )
		);
	} );

	test( 'should dispatch tracks event if complete', () => {
		const dispatch = sinon.spy();
		receiveStatus( { dispatch }, { siteId }, COMPLETE_RESPONSE );
		expect( dispatch ).to.have.callCount( 3 );
		expect( dispatch ).to.have.been.calledWith(
			recordTracksEvent( 'calypso_automated_transfer_complete', {
				context: 'plugin_upload',
				transfer_id: 1,
				uploaded_plugin_slug: 'hello-dolly',
			} )
		);
	} );

	test( 'should request status again if not complete', () => {
		const dispatch = sinon.spy();
		receiveStatus( { dispatch }, { siteId }, IN_PROGRESS_RESPONSE );
		clock.tick( 4000 );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith( fetchAutomatedTransferStatus( siteId ) );
	} );
} );
