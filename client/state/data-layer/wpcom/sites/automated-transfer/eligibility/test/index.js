/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	requestAutomatedTransferEligibility,
	updateAutomatedTransferEligibility,
	throwRequestError,
} from 'state/data-layer/wpcom/sites/automated-transfer/eligibility';

describe( 'requestAutomatedTransferEligibility', () => {
	it( 'should dispatch an http request', () => {
		const dispatch = sinon.spy();
		const siteId = 2916284;
		requestAutomatedTransferEligibility( { dispatch }, { siteId } );
		expect( dispatch ).to.have.been.calledWithMatch( {
			method: 'GET',
			path: `/sites/${ siteId }/automated-transfers/eligibility`,
		} );
	} );
} );

describe( 'updateAutomatedTransferEligibility', () => {
	it( 'should dispatch an update eligibility action ', () => {
		const dispatch = sinon.spy();
		const action = { type: 'AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST', siteId: 2916284 };
		updateAutomatedTransferEligibility( { dispatch }, action, { warnings: {}, errors: [] } );
		expect( dispatch ).to.have.been.calledWith(
			sinon.match( { type: 'AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE', siteId: 2916284 } )
		);
	} );
} );

// TODO: Find out why we're throwing
describe( 'throwRequestError', () => {
	it( 'should throw an error', () => {
		const testError = () => {
			throwRequestError( {}, {}, {} );
		};
		expect( testError ).to.throw();
	} );
} );
