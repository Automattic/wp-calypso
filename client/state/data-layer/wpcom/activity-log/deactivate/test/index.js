/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { deactivateSucceeded, deactivateFailed } from '../';
import { rewindDeactivateSuccess, rewindDeactivateFailure } from 'state/activity-log/actions';

const siteId = 77203074;

describe( 'dectivateSucceeded', () => {
	it( 'should dispatch rewind deactivate success action', () => {
		const dispatch = sinon.spy();
		deactivateSucceeded( { dispatch }, { siteId } );
		expect( dispatch ).to.have.been.calledWith(
			rewindDeactivateSuccess( siteId )
		);
	} );
} );

describe( 'deactivateFailed', () => {
	it( 'should dispatch rewind deactivate failed action', () => {
		const dispatch = sinon.spy();
		deactivateFailed( { dispatch }, { siteId }, { message: 'some problem' } );
		expect( dispatch ).to.have.been.calledWith(
			rewindDeactivateFailure( siteId )
		);
	} );

	it( 'should dispatch an error notice', () => {
		const dispatch = sinon.spy();
		deactivateFailed( { dispatch }, { siteId }, { message: 'some problem' } );
		expect( dispatch ).to.have.been.calledWith( sinon.match( {
			notice: {
				status: 'is-error',
				text: 'Problem deactivating rewind: some problem'
			}
		} ) );
	} );
} );

