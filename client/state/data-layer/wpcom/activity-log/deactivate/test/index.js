/**
 * Internal dependencies
 */
import { deactivateSucceeded, deactivateFailed } from '../';
import {
	rewindDeactivateSuccess,
	rewindDeactivateFailure,
} from 'calypso/state/activity-log/actions';

const siteId = 77203074;

describe( 'dectivateSucceeded', () => {
	test( 'should dispatch rewind deactivate success action', () => {
		expect( deactivateSucceeded( { siteId } ) ).toEqual( rewindDeactivateSuccess( siteId ) );
	} );
} );

describe( 'deactivateFailed', () => {
	test( 'should dispatch rewind deactivate failed action', () => {
		expect( deactivateFailed( { siteId }, { message: 'some problem' } ) ).toContainEqual(
			rewindDeactivateFailure( siteId )
		);
	} );

	test( 'should dispatch an error notice', () => {
		expect( deactivateFailed( { siteId }, { message: 'some problem' } ) ).toContainEqual(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					status: 'is-error',
					text: 'Problem deactivating rewind: some problem',
				} ),
			} )
		);
	} );
} );
