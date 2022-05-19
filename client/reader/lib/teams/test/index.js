import { isAutomatticTeamMember } from '../';

describe( 'isAutomatticTeamMember', () => {
	test( 'should return true if teams include a8c', () => {
		expect( isAutomatticTeamMember( [ { slug: 'a8c' }, { slug: 'okapi' } ] ) ).toBe( true );
	} );

	test( 'should return false if teams do include a8c', () => {
		expect( isAutomatticTeamMember( [] ) ).toBe( false );
		expect( isAutomatticTeamMember( [ { slug: 'okapi' } ] ) ).toBe( false );
	} );
} );
