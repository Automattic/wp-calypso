/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { useFakeTimers } from 'test/helpers/use-sinon';
import {
	requestStatus,
	receiveStatus,
} from '../';
import {
	getAutomatedTransferStatus,
	setAutomatedTransferStatus,
} from 'state/automated-transfer/actions';

const siteId = 1916284;

const COMPLETE_RESPONSE = {
	blog_id: 1916284,
	status: 'complete',
	uploaded_plugin_slug: 'hello-dolly',
};

const IN_PROGRESS_RESPONSE = {
	blog_id: 1916284,
	status: 'uploading',
	uploaded_plugin_slug: 'hello-dolly',
};

describe( 'requestStatus', () => {
	it( 'should dispatch an http request', () => {
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
	useFakeTimers( fakeClock => clock = fakeClock );

	it( 'should dispatch set status action', () => {
		const dispatch = sinon.spy();
		receiveStatus( { dispatch }, { siteId }, COMPLETE_RESPONSE );
		expect( dispatch ).to.have.callCount( 4 );
		expect( dispatch ).to.have.been.calledWith(
			setAutomatedTransferStatus( siteId, 'complete', 'hello-dolly' )
		);
	} );

	it( 'should dispatch success notice if complete', () => {
		const dispatch = sinon.spy();
		receiveStatus( { dispatch }, { siteId }, COMPLETE_RESPONSE );
		expect( dispatch ).to.have.callCount( 4 );
		expect( dispatch ).to.have.been.calledWithMatch( {
			notice: { text: "You've successfully uploaded the hello-dolly plugin." }
		} );
	} );

	it( 'should request status again if not complete', () => {
		const dispatch = sinon.spy();
		receiveStatus( { dispatch }, { siteId }, IN_PROGRESS_RESPONSE );
		clock.tick( 4000 );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith(
			getAutomatedTransferStatus( siteId )
		);
	} );
} );
