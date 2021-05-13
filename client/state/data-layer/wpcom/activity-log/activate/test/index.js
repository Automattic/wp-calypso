/**
 * Internal dependencies
 */
import { activateSucceeded, activateFailed } from '../';
import { rewindActivateSuccess, rewindActivateFailure } from 'calypso/state/activity-log/actions';

const siteId = 77203074;

describe( 'activateSucceeded', () => {
	test( 'should dispatch rewind activate success action', () => {
		expect( activateSucceeded( { siteId } ) ).toEqual( rewindActivateSuccess( siteId ) );
	} );
} );

describe( 'activateFailed', () => {
	test( 'should dispatch rewind activate failed action', () => {
		expect( activateFailed( { siteId }, { message: 'some problem' } ) ).toContainEqual(
			rewindActivateFailure( siteId )
		);
	} );

	test( 'should dispatch an error notice', () => {
		expect( activateFailed( { siteId }, { message: 'some problem' } ) ).toContainEqual(
			expect.objectContaining( {
				notice: expect.objectContaining( {
					status: 'is-error',
					text: 'Problem activating rewind: some problem',
				} ),
			} )
		);
	} );
} );
