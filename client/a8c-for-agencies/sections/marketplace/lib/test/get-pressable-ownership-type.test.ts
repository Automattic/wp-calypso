import { getPressableOwnershipType } from '../get-pressable-ownership-type';
import type { Agency } from 'calypso/state/a8c-for-agencies/types';

function createAgency(
	pressable: { pressable_id?: string; a4a_id?: string | null } | null
): Agency {
	return {
		third_party: pressable ? { pressable } : {},
	} as unknown as Agency;
}

describe( 'getPressableOwnershipType', () => {
	it( 'returns "none" when the agency is null', () => {
		expect( getPressableOwnershipType( null ) ).toBe( 'none' );
	} );

	it( 'returns "none" when the agency has no Pressable plan', () => {
		expect( getPressableOwnershipType( createAgency( null ) ) ).toBe( 'none' );
		expect( getPressableOwnershipType( createAgency( {} ) ) ).toBe( 'none' );
	} );

	it( 'returns "regular" for a Pressable plan not bought through the A4A marketplace', () => {
		const agency = createAgency( { pressable_id: '123', a4a_id: null } );
		expect( getPressableOwnershipType( agency ) ).toBe( 'regular' );
	} );

	it( 'returns "agency" for a Pressable plan bought through the A4A marketplace', () => {
		const agency = createAgency( { pressable_id: '123', a4a_id: '456' } );
		expect( getPressableOwnershipType( agency ) ).toBe( 'agency' );
	} );
} );
