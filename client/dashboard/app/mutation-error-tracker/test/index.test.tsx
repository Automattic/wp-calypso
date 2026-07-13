/**
 * @jest-environment jsdom
 */
import { render } from '../../../test-utils';
import { bumpStat } from '../../analytics';
import MutationErrorTracker from '../index';

jest.mock( '../../analytics', () => ( {
	...jest.requireActual( '../../analytics' ),
	bumpStat: jest.fn(),
} ) );

const mockedBumpStat = jest.mocked( bumpStat );

function wpError( fields: { status: number; statusCode: number; error?: string } ) {
	return Object.assign( new Error( 'boom' ), fields );
}

describe( '<MutationErrorTracker>', () => {
	test( 'bumps a KEY:status stat when a keyed WPError mutation fails', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = wpError( { status: 500, statusCode: 500, error: 'internal_server_error' } );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			mutationKey: [ 'PULL_FROM_STAGING', 12345 ],
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpStat ).toHaveBeenCalledWith( 'hd-mutation-error', 'PULL_FROM_STAGING:500' );
	} );

	test( 'bumps the key label alone for an unkeyed, non-WPError failure', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = new Error( 'plain' );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpStat ).toHaveBeenCalledWith( 'hd-mutation-error', 'unknown' );
	} );

	test( 'does not bump anything when a mutation succeeds', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const mutation = queryClient.getMutationCache().build( queryClient, {
			mutationFn: () => Promise.resolve( 'ok' ),
		} );

		await mutation.execute( undefined );

		expect( mockedBumpStat ).not.toHaveBeenCalled();
	} );
} );
