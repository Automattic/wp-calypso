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
	test( 'bumps the trackingId stat when a WPError mutation fails', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = wpError( { status: 500, statusCode: 500, error: 'internal_server_error' } );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			meta: { trackingId: 'registerTwoStepAuthSecurityKey' },
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpStat ).toHaveBeenCalledWith(
			'dashboard-mutation-error',
			'registerTwoStepAuthSecurityKey'
		);
	} );

	test( 'does not bump anything for a 4xx WPError failure', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = wpError( { status: 403, statusCode: 403, error: 'forbidden' } );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			meta: { trackingId: 'registerTwoStepAuthSecurityKey' },
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpStat ).not.toHaveBeenCalled();
	} );

	test( 'does not bump anything for a non-WPError failure', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = new Error( 'NotAllowedError' );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			meta: { trackingId: 'registerTwoStepAuthSecurityKey' },
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpStat ).not.toHaveBeenCalled();
	} );

	test( 'does not bump anything for a failure without a trackingId', async () => {
		const { queryClient } = render( <MutationErrorTracker /> );

		const error = new Error( 'plain' );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( mockedBumpStat ).not.toHaveBeenCalled();
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
