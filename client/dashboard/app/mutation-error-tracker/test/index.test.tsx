/**
 * @jest-environment jsdom
 */
import { render } from '../../../test-utils';
import MutationErrorTracker from '../index';

function wpError( fields: { status: number; statusCode: number; error?: string } ) {
	return Object.assign( new Error( 'boom' ), fields );
}

describe( 'MutationErrorTracker', () => {
	it( 'records categorical fields when a keyed WPError mutation fails', async () => {
		const { recordTracksEvent, queryClient } = render( <MutationErrorTracker /> );

		const error = wpError( { status: 500, statusCode: 500, error: 'internal_server_error' } );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			mutationKey: [ 'PULL_FROM_STAGING', 12345 ],
			meta: { snackbar: { error: 'Failed to pull' } },
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_mutation_error', {
			has_snackbar: true,
			mutation_key: 'PULL_FROM_STAGING',
			status: 500,
			error_code: 'internal_server_error',
		} );
	} );

	it( 'omits the key and error fields for an unkeyed, non-WPError failure', async () => {
		const { recordTracksEvent, queryClient } = render( <MutationErrorTracker /> );

		const error = new Error( 'plain' );
		const mutation = queryClient.getMutationCache().build( queryClient, {
			mutationFn: () => Promise.reject( error ),
		} );

		await expect( mutation.execute( undefined ) ).rejects.toBe( error );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_mutation_error', {
			has_snackbar: false,
		} );
	} );

	it( 'does not record anything when a mutation succeeds', async () => {
		const { recordTracksEvent, queryClient } = render( <MutationErrorTracker /> );

		const mutation = queryClient.getMutationCache().build( queryClient, {
			mutationFn: () => Promise.resolve( 'ok' ),
		} );

		await mutation.execute( undefined );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
