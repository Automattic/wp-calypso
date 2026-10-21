import { isEnabled } from '@automattic/calypso-config';
import { isAutomatticTeamMember, isSavedPostsEnabled } from '../';

jest.mock( '@automattic/calypso-config', () => ( { isEnabled: jest.fn() } ) );

describe( 'isAutomatticTeamMember', () => {
	test( 'should return true if teams include a8c', () => {
		expect( isAutomatticTeamMember( [ { slug: 'a8c' }, { slug: 'okapi' } ] ) ).toBe( true );
	} );

	test( 'should return false if teams do include a8c', () => {
		expect( isAutomatticTeamMember( [] ) ).toBe( false );
		expect( isAutomatticTeamMember( [ { slug: 'okapi' } ] ) ).toBe( false );
	} );
} );

describe( 'isSavedPostsEnabled', () => {
	const A8C = [ { slug: 'a8c' } ];

	beforeEach( () => {
		isEnabled.mockImplementation( ( flag ) => flag === 'reader/saved-posts' );
	} );

	test( 'should return true for Automatticians when the flag is on', () => {
		expect( isSavedPostsEnabled( A8C ) ).toBe( true );
	} );

	test( 'should return false for everyone else', () => {
		expect( isSavedPostsEnabled( [ { slug: 'okapi' } ] ) ).toBe( false );
		expect( isSavedPostsEnabled( undefined ) ).toBe( false );
	} );

	test( 'should return false when the flag is off', () => {
		isEnabled.mockReturnValue( false );

		expect( isSavedPostsEnabled( A8C ) ).toBe( false );
	} );
} );
