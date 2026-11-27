import { userPreferenceMutation } from '@automattic/api-queries';
import { withSnackbar } from '../with-snackbar';

describe( 'withSnackbar', () => {
	test( 'keeps the meta set by the factory', () => {
		const options = userPreferenceMutation( 'reader-seen-posts' );

		expect( withSnackbar( options, { success: 'Saved.' } ).meta ).toEqual( {
			...options.meta,
			snackbar: { success: 'Saved.' },
		} );
	} );

	// `tsc` fails if any of these calls stops being a type error.
	test( 'checks messages against the mutation types', () => {
		expect.assertions( 0 );
		const options = userPreferenceMutation( 'reader-seen-posts' );

		withSnackbar( options, {
			// @ts-expect-error The variables are a boolean.
			success: ( _data, enabled: string ) => enabled,
		} );
		withSnackbar( options, {
			// @ts-expect-error `Error` has no `nope` property.
			error: ( error ) => error.nope,
		} );
		withSnackbar( options, {
			// @ts-expect-error A message is a string.
			success: () => 42,
		} );
	} );
} );
