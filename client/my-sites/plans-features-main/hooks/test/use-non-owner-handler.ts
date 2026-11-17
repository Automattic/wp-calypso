/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useNonOwnerHandler } from '../use-non-owner-handler';
import type { Plans } from '@automattic/data-stores';

const mockHelpCenterActions = {
	setShowHelpCenter: jest.fn(),
	setNavigateToRoute: jest.fn(),
	setOdieBotNameSlug: jest.fn(),
	setOdieInitialPromptText: jest.fn(),
};
const mockEnsureQueryData = jest.fn();

jest.mock( '@automattic/data-stores/src/purchases/queries/lib/use-query-keys-factory', () => ( {
	__esModule: true,
	default: () => ( { sitePurchases: ( siteId: number ) => [ 'site-purchases', siteId ] } ),
} ) );

jest.mock( '@automattic/data-stores/src/purchases/queries/use-site-purchases', () => ( {
	getUseSitePurchasesOptions: ( _params: unknown, queryKey: unknown[] ) => ( { queryKey } ),
} ) );

jest.mock( '@automattic/data-stores/src/site/queries/lib/use-query-keys-factory', () => ( {
	__esModule: true,
	default: () => ( {
		siteUser: ( siteId: number, userId: number ) => [ 'site-user', siteId, userId ],
	} ),
} ) );

jest.mock( '@automattic/data-stores/src/site/queries/use-site-user-query', () => ( {
	getUseSiteUserQueryOptions: ( _siteId: number, _userId: number, queryKey: unknown[] ) => ( {
		queryKey,
	} ),
} ) );

jest.mock( '@automattic/help-center/src/stores', () => ( {
	HELP_CENTER_STORE: 'automattic/help-center',
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQueryClient: () => ( { ensureQueryData: mockEnsureQueryData } ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => mockHelpCenterActions,
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

describe( 'useNonOwnerHandler', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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
