import { mutationOptions } from '@tanstack/react-query';
import { withSnackbar } from '../with-snackbar';

describe( 'withSnackbar()', () => {
	test( 'preserves meta the mutation already carries', () => {
		const options = mutationOptions( {
			meta: { statId: 'foo-mut' },
			mutationFn: () => Promise.resolve(),
		} );

		const result = withSnackbar( options, { success: 'Saved.' } );

		expect( result.meta ).toEqual( {
			statId: 'foo-mut',
			snackbar: { success: 'Saved.' },
		} );
	} );

	test( 'attaches a snackbar when the mutation has no meta', () => {
		const options = mutationOptions( { mutationFn: () => Promise.resolve() } );

		const result = withSnackbar( options, { success: 'Saved.' } );

		expect( result.meta ).toEqual( { snackbar: { success: 'Saved.' } } );
	} );

	test( 'does not mutate the options it is given', () => {
		const options = mutationOptions( {
			meta: { statId: 'foo-mut' },
			mutationFn: () => Promise.resolve(),
		} );

		withSnackbar( options, { success: 'Saved.' } );

		expect( options.meta ).toEqual( { statId: 'foo-mut' } );
	} );

	test( 'keeps the rest of the mutation options intact', () => {
		const mutationFn = () => Promise.resolve();
		const onSuccess = () => {};
		const options = mutationOptions( { meta: { statId: 'foo-mut' }, mutationFn, onSuccess } );

		const result = withSnackbar( options, { error: { source: 'server' } } );

		expect( result.mutationFn ).toBe( mutationFn );
		expect( result.onSuccess ).toBe( onSuccess );
	} );
} );
