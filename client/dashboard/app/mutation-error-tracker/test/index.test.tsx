/**
 * @jest-environment jsdom
 */
import { render } from '../../../test-utils';
import { bumpMultipleStats } from '../../analytics';
import MutationErrorTracker from '../index';

jest.mock( '../../analytics', () => ( {
	...jest.requireActual( '../../analytics' ),
	bumpMultipleStats: jest.fn(),
} ) );

const mockedBumpMultipleStats = jest.mocked( bumpMultipleStats );

function wpError( fields: { status: number; statusCode: number; error?: string } ) {
	return Object.assign( new Error( 'boom' ), fields );
}

describe( '<MutationErrorTracker>', () => {
	test( 'names the stat from meta.statId and buckets a 5xx WPError', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = wpError( { status: 500, statusCode: 500, error: 'internal_server_error' } );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			meta: { statId: '2fa-security-key-delete' },
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpMultipleStats ).toHaveBeenCalledWith(
			[ 'dashboard-mutation-error', '2fa-security-key-delete' ],
			[ 'dashboard-mutation-error-status', '2fa-security-key-delete.500' ],
			[ 'dashboard-mutation-error-5xx', '2fa-security-key-delete' ]
		);
	} );

	test( 'buckets a 4xx WPError separately', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = wpError( { status: 403, statusCode: 403, error: 'forbidden' } );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			meta: { statId: '2fa-security-key-register' },
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpMultipleStats ).toHaveBeenCalledWith(
			[ 'dashboard-mutation-error', '2fa-security-key-register' ],
			[ 'dashboard-mutation-error-status', '2fa-security-key-register.403' ],
			[ 'dashboard-mutation-error-4xx', '2fa-security-key-register' ]
		);
	} );

	test( 'flags a non-WPError failure as other rather than by status', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = new Error( 'plain' );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			meta: { statId: '2fa-security-key-register' },
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpMultipleStats ).toHaveBeenCalledWith(
			[ 'dashboard-mutation-error', '2fa-security-key-register' ],
			[ 'dashboard-mutation-error-other', '2fa-security-key-register' ]
		);
	} );

	test( 'falls back to `missing` for a mutation with no statId', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = wpError( { status: 500, statusCode: 500 } );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpMultipleStats ).toHaveBeenCalledWith(
			[ 'dashboard-mutation-error', 'missing' ],
			[ 'dashboard-mutation-error-status', 'missing.500' ],
			[ 'dashboard-mutation-error-5xx', 'missing' ]
		);
	} );

	test( 'does not bump anything when a mutation succeeds', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const mutation = queryClient.getMutationCache().build( queryClient, {
			meta: { statId: '2fa-security-key-register' },
			mutationFn: () => Promise.resolve( 'ok' ),
		} );

		await mutation.execute( undefined );

		expect( mockedBumpMultipleStats ).not.toHaveBeenCalled();
	} );
} );
