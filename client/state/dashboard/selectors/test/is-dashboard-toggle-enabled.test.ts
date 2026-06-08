import { isEnabled } from '@automattic/calypso-config';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { isDashboardToggleEnabled } from '../is-dashboard-toggle-enabled';

const OLDEST_ELIGIBLE_USER = 275231967;

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => {
		if ( key === 'dashboard_opt_in_oldest_eligible_user' ) {
			return 275231967;
		}
		return undefined;
	};
	config.isEnabled = jest.fn();
	return config;
} );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: jest.fn(),
} ) );

const mockedIsEnabled = jest.mocked( isEnabled );
const mockedGetCurrentUser = jest.mocked( getCurrentUser );

describe( 'isDashboardToggleEnabled', () => {
	const state = {} as any;

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'when dashboard/v2 feature is disabled', () => {
		beforeEach( () => {
			mockedIsEnabled.mockReturnValue( false );
		} );

		it( 'returns false for a regular eligible user', () => {
			mockedGetCurrentUser.mockReturnValue( { ID: OLDEST_ELIGIBLE_USER - 1 } as any );
			expect( isDashboardToggleEnabled( state ) ).toBe( false );
		} );

		it( 'returns false for a proxied user', () => {
			mockedGetCurrentUser.mockReturnValue( { ID: OLDEST_ELIGIBLE_USER + 1 } as any );
			expect( isDashboardToggleEnabled( state, true ) ).toBe( false );
		} );
	} );

	describe( 'when dashboard/v2 feature is enabled', () => {
		beforeEach( () => {
			mockedIsEnabled.mockReturnValue( true );
		} );

		it( 'returns false when no user is loaded', () => {
			mockedGetCurrentUser.mockReturnValue( null );
			expect( isDashboardToggleEnabled( state ) ).toBe( false );
		} );

		it( 'returns false for a user created after the eligibility cut-off', () => {
			mockedGetCurrentUser.mockReturnValue( { ID: OLDEST_ELIGIBLE_USER + 1 } as any );
			expect( isDashboardToggleEnabled( state ) ).toBe( false );
		} );

		it( 'returns true for a user created before the eligibility cut-off', () => {
			mockedGetCurrentUser.mockReturnValue( { ID: OLDEST_ELIGIBLE_USER - 1 } as any );
			expect( isDashboardToggleEnabled( state ) ).toBe( true );
		} );

		it( 'returns true for a user created exactly at the eligibility cut-off', () => {
			mockedGetCurrentUser.mockReturnValue( { ID: OLDEST_ELIGIBLE_USER } as any );
			expect( isDashboardToggleEnabled( state ) ).toBe( true );
		} );

		describe( 'proxied users (isProxiedUser = true)', () => {
			it( 'returns true regardless of user ID', () => {
				mockedGetCurrentUser.mockReturnValue( { ID: OLDEST_ELIGIBLE_USER + 9999 } as any );
				expect( isDashboardToggleEnabled( state, true ) ).toBe( true );
			} );

			it( 'returns true even when no user is loaded', () => {
				mockedGetCurrentUser.mockReturnValue( null );
				expect( isDashboardToggleEnabled( state, true ) ).toBe( true );
			} );
		} );
	} );
} );
