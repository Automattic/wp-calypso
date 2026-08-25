import { getCancelIntentFromQuery } from '../utils';

describe( 'getCancelIntentFromQuery', () => {
	test( 'returns "cancel" when query.intent is "cancel"', () => {
		expect( getCancelIntentFromQuery( { intent: 'cancel' } ) ).toBe( 'cancel' );
	} );

	test( 'returns "remove" when query.intent is "remove"', () => {
		expect( getCancelIntentFromQuery( { intent: 'remove' } ) ).toBe( 'remove' );
	} );

	test( 'returns null when query.intent is absent', () => {
		expect( getCancelIntentFromQuery( {} ) ).toBeNull();
	} );

	test( 'returns null for unknown strings', () => {
		expect( getCancelIntentFromQuery( { intent: 'refund' } ) ).toBeNull();
		expect( getCancelIntentFromQuery( { intent: '' } ) ).toBeNull();
	} );

	test( 'handles array-style duplicate params by picking the first', () => {
		expect( getCancelIntentFromQuery( { intent: [ 'remove', 'cancel' ] } ) ).toBe( 'remove' );
		expect( getCancelIntentFromQuery( { intent: [ 'cancel' ] } ) ).toBe( 'cancel' );
	} );
} );
