/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useNonOwnerHandler } from '../use-non-owner-handler';
import type { Plans } from '@automattic/data-stores';

const mockHelpCenterActions = {
	setShowHelpCenter: vi.fn(),
	setNavigateToRoute: vi.fn(),
	setOdieBotNameSlug: vi.fn(),
	setOdieInitialPromptText: vi.fn(),
};
const mockEnsureQueryData = vi.fn();

vi.mock( '@automattic/data-stores/src/purchases/queries/lib/use-query-keys-factory', () => ( {
	__esModule: true,
	default: () => ( { sitePurchases: ( siteId: number ) => [ 'site-purchases', siteId ] } ),
} ) );

vi.mock( '@automattic/data-stores/src/purchases/queries/use-site-purchases', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		getUseSitePurchasesOptions: ( _params: unknown, queryKey: unknown[] ) => ( { queryKey } ),
	} )
);

vi.mock( '@automattic/data-stores/src/site/queries/lib/use-query-keys-factory', () => ( {
	__esModule: true,
	default: () => ( {
		siteUser: ( siteId: number, userId: number ) => [ 'site-user', siteId, userId ],
	} ),
} ) );

vi.mock( '@automattic/data-stores/src/site/queries/use-site-user-query', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		getUseSiteUserQueryOptions: ( _siteId: number, _userId: number, queryKey: unknown[] ) => ( {
			queryKey,
		} ),
	} )
);

vi.mock( '@automattic/help-center/src/stores', () => ( {
	HELP_CENTER_STORE: 'automattic/help-center',
} ) );

vi.mock( '@tanstack/react-query', () => ( {
	useQueryClient: () => ( { ensureQueryData: mockEnsureQueryData } ),
} ) );

vi.mock( '@wordpress/data', () => ( {
	useDispatch: () => mockHelpCenterActions,
} ) );

vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useTranslate: () => ( text: string ) => text,
	} )
);

describe( 'useNonOwnerHandler', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mockEnsureQueryData.mockImplementation( async ( { queryKey } ) =>
			queryKey[ 0 ] === 'site-purchases'
				? { 42: { user_id: '7' } }
				: { name: 'Plan Owner', nice_name: 'planowner', email: 'owner@example.com' }
		);
	} );

	it( 'opens Odie on the default bot', async () => {
		const { result } = renderHook( () =>
			useNonOwnerHandler( { siteId: 1, currentPlan: { purchaseId: 42 } as Plans.SitePlan } )
		);

		await result.current( { availableForPurchase: true } );

		// The plan support bot was retired, so the default bot answers.
		expect( mockHelpCenterActions.setOdieBotNameSlug ).not.toHaveBeenCalled();
		expect( mockHelpCenterActions.setNavigateToRoute ).toHaveBeenCalledWith( '/odie' );
		expect( mockHelpCenterActions.setShowHelpCenter ).toHaveBeenCalledWith( true );
	} );
} );
