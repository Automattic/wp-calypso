import { getPressableUsageWarning } from '../usage-warnings';

describe( 'getPressableUsageWarning', () => {
	it( 'returns null when usage is within storage capacity', () => {
		expect( getPressableUsageWarning( 'storage', 10, 10 ) ).toBeNull();
	} );

	it( 'returns storage warning details when storage exceeds capacity', () => {
		expect( getPressableUsageWarning( 'storage', 11, 10 ) ).toEqual( {
			metric: 'storage',
			addOnLabelKey: 'storage',
		} );
	} );

	it( 'returns visits warning details when visits exceed capacity', () => {
		expect( getPressableUsageWarning( 'visits', 10001, 10000 ) ).toEqual( {
			metric: 'visits',
			addOnLabelKey: 'visits',
		} );
	} );

	it( 'returns null when usage and capacity are both zero', () => {
		expect( getPressableUsageWarning( 'visits', 0, 0 ) ).toBeNull();
	} );
} );
