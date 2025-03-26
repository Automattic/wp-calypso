import { isPlansPageUntangled } from 'calypso/lib/plans/untangling-plans-experiment';
import isScheduledUpdatesMultisiteRoute from 'calypso/state/selectors/is-scheduled-updates-multisite-route';
import { shouldShowSiteDashboard, getShouldShowGlobalSidebar } from '../selectors';
import type { AppState } from 'calypso/types';

jest.mock( 'calypso/lib/plans/untangling-plans-experiment', () => ( {
	isPlansPageUntangled: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/is-scheduled-updates-multisite-route', () => ( {
	__esModule: true,
	default: jest.fn(),
	isScheduledUpdatesMultisiteCreateRoute: jest.fn(),
	isScheduledUpdatesMultisiteEditRoute: jest.fn(),
} ) );

describe( 'Global Sidebar Selectors', () => {
	const createMockState = ( path: string ): AppState =>
		( {
			route: {
				path: {
					current: path,
				},
			},
		} ) as AppState;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'shouldShowSiteDashboard', () => {
		it( 'should return false when siteId is null', () => {
			const state = createMockState( '/setup' );
			expect( shouldShowSiteDashboard( state, null ) ).toBe( false );
		} );

		it( 'should return true for setup route with valid siteId', () => {
			const state = createMockState( '/setup' );
			expect( shouldShowSiteDashboard( state, 123 ) ).toBe( true );
		} );

		it( 'should return true for start route with valid siteId', () => {
			const state = createMockState( '/start' );
			expect( shouldShowSiteDashboard( state, 123 ) ).toBe( true );
		} );

		it( 'should return false for non-dashboard routes', () => {
			const state = createMockState( '/some-other-route' );
			expect( shouldShowSiteDashboard( state, 123 ) ).toBe( false );
		} );

		it( 'should include plans route when plans page is untangled', () => {
			const state = createMockState( '/plans' );
			( isPlansPageUntangled as jest.Mock ).mockReturnValue( true );
			expect( shouldShowSiteDashboard( state, 123 ) ).toBe( true );
		} );

		it( 'should not include plans route when plans page is not untangled', () => {
			const state = createMockState( '/plans' );
			( isPlansPageUntangled as jest.Mock ).mockReturnValue( false );
			expect( shouldShowSiteDashboard( state, 123 ) ).toBe( false );
		} );
	} );

	describe( 'getShouldShowGlobalSidebar', () => {
		it( 'should return true for me section', () => {
			const state = createMockState( '/me' );
			expect( getShouldShowGlobalSidebar( state, null, 'me' ) ).toBe( true );
		} );

		it( 'should return true for reader section', () => {
			const state = createMockState( '/reader' );
			expect( getShouldShowGlobalSidebar( state, null, 'reader' ) ).toBe( true );
		} );

		it( 'should return true for sites section with no siteId', () => {
			const state = createMockState( '/sites' );
			expect( getShouldShowGlobalSidebar( state, null, 'sites' ) ).toBe( true );
		} );

		it( 'should return false for tangled routes in the sites section', () => {
			const state = createMockState( '/domains/manage' );
			expect( getShouldShowGlobalSidebar( state, 123, 'sites' ) ).toBe( false );
		} );

		it( 'should return true for tangled routes in the sites-dashboard section', () => {
			const state = createMockState( '/domains/manage' );
			expect( getShouldShowGlobalSidebar( state, 123, 'sites-dashboard' ) ).toBe( true );
		} );

		it( 'should handle scheduled updates multisite route', () => {
			const state = createMockState( '/plugins' );
			( isScheduledUpdatesMultisiteRoute as jest.Mock ).mockReturnValue( true );
			expect( getShouldShowGlobalSidebar( state, 123, 'sites' ) ).toBe( true );
		} );
	} );
} );
