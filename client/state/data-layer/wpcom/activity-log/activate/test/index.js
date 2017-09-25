/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { activateSucceeded, activateFailed } from '../';
import { rewindActivateSuccess, rewindActivateFailure } from 'state/activity-log/actions';

const siteId = 77203074;

describe( 'activateSucceeded', () => {
	it( 'should dispatch rewind activate success action', () => {
		const dispatch = sinon.spy();
		activateSucceeded( { dispatch }, { siteId } );
		expect( dispatch ).to.have.been.calledWith(
			rewindActivateSuccess( siteId )
		);
	} );
} );

describe( 'activateFailed', () => {
	it( 'should dispatch rewind activate failed action', () => {
		const dispatch = sinon.spy();
		activateFailed( { dispatch }, { siteId }, { message: 'some problem' } );
		expect( dispatch ).to.have.been.calledWith(
			rewindActivateFailure( siteId )
		);
	} );

	it( 'should dispatch an error notice', () => {
		const dispatch = sinon.spy();
		activateFailed( { dispatch }, { siteId }, { message: 'some problem' } );
		expect( dispatch ).to.have.been.calledWith( sinon.match( {
			notice: {
				status: 'is-error',
				text: 'Problem activating rewind: some problem'
			}
		} ) );
	} );
} );

