/**
 * @jest-environment node
 */
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { hasNoWPAdminAccess } from '../use-wp-admin-access-control';

jest.mock( 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies' );

const mockedIsA8CForAgencies = isA8CForAgencies as jest.MockedFunction< typeof isA8CForAgencies >;

describe( 'hasNoWPAdminAccess', () => {
	beforeEach( () => {
		mockedIsA8CForAgencies.mockReturnValue( true );
	} );

	it( 'returns true for a team member without manage_options on the site', () => {
		expect(
			hasNoWPAdminAccess( { role: 'a4a_manager', capabilities: { manage_options: false } } )
		).toBe( true );
	} );

	it( 'returns true for a team member with no capabilities for the site', () => {
		expect( hasNoWPAdminAccess( { role: 'a4a_manager', capabilities: undefined } ) ).toBe( true );
	} );

	it( 'returns false for a team member who has manage_options on the site', () => {
		expect(
			hasNoWPAdminAccess( { role: 'a4a_manager', capabilities: { manage_options: true } } )
		).toBe( false );
	} );

	it( 'returns false for an agency owner regardless of capabilities', () => {
		expect( hasNoWPAdminAccess( { role: 'a4a_administrator', capabilities: undefined } ) ).toBe(
			false
		);
	} );

	it( 'returns false when not in the A4A context', () => {
		mockedIsA8CForAgencies.mockReturnValue( false );
		expect(
			hasNoWPAdminAccess( { role: 'a4a_manager', capabilities: { manage_options: false } } )
		).toBe( false );
	} );

	it( 'returns false when the role is undefined', () => {
		expect( hasNoWPAdminAccess( { role: undefined, capabilities: undefined } ) ).toBe( false );
	} );
} );
