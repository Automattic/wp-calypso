/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { deactivateSucceeded, deactivateFailed } from '../';
import {
	rewindDeactivateSuccess,
	rewindDeactivateFailure,
} from 'client/state/activity-log/actions';

const siteId = 77203074;

describe( 'dectivateSucceeded', () => {
	test( 'should dispatch rewind deactivate success action', () => {
		const dispatch = sinon.spy();
		deactivateSucceeded( { dispatch }, { siteId } );
		expect( dispatch ).to.have.been.calledWith( rewindDeactivateSuccess( siteId ) );
	} );
} );

describe( 'deactivateFailed', () => {
	test( 'should dispatch rewind deactivate failed action', () => {
		const dispatch = sinon.spy();
		deactivateFailed( { dispatch }, { siteId }, { message: 'some problem' } );
		expect( dispatch ).to.have.been.calledWith( rewindDeactivateFailure( siteId ) );
	} );

	test( 'should dispatch an error notice', () => {
		const dispatch = sinon.spy();
		deactivateFailed( { dispatch }, { siteId }, { message: 'some problem' } );
		expect( dispatch ).to.have.been.calledWith(
			sinon.match( {
				notice: {
					status: 'is-error',
					text: 'Problem deactivating rewind: some problem',
				},
			} )
		);
	} );
} );
