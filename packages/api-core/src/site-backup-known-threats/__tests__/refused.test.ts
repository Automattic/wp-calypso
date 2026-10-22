import { getRefusedKnownThreats } from '../fetchers';

const counts = ( flagged: number ) => ( {
	malware: flagged,
	database: 0,
	vulnerable: 0,
	ignored: 0,
	flagged,
	fixed: 0,
} );

describe( 'getRefusedKnownThreats', () => {
	it( 'keeps the counts the refusal carries', () => {
		expect( getRefusedKnownThreats( counts( 3 ) ) ).toEqual( counts( 3 ) );
	} );

	it.each( [ undefined, null, 'oops', {}, { flagged: '3' }, counts( 0 ) ] )(
		'returns zeros for unusable counts: %p',
		( value ) => {
			expect( getRefusedKnownThreats( value ) ).toEqual( counts( 0 ) );
		}
	);
} );
