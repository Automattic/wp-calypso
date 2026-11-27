/**
 * @vitest-environment jsdom
 */
import { wowFunnelPendingQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { PLAN_FREE, PLAN_STUDENT } from '@automattic/calypso-products';
import { useCurrentPlan } from '@automattic/data-stores/src/plans';
import { QueryClient } from '@tanstack/react-query';
import { vi } from 'vitest';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import purchasesReducer from 'calypso/state/purchases/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PlansWrapper from '../main';

vi.mock( '@automattic/calypso-config' );
vi.mock( 'calypso/components/data/document-head', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/data/query-site-purchases', () => ( { default: vi.fn() } ) );
vi.mock( 'calypso/components/data/query-products-list', () => ( { default: vi.fn() } ) );
vi.mock( '@automattic/data-stores/src/plans/hooks/use-current-plan', () => ( {
	default: vi.fn(),
} ) );
vi.mock( 'calypso/my-sites/plans-features-main', () => ( { default: vi.fn( () => null ) } ) );

const SITE_ID = 1;

const initialState = {
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				slug: 'example.wordpress.com',
				plan: { product_slug: PLAN_STUDENT, user_is_owner: true },
			},
		},
	},
	ui: { selectedSiteId: SITE_ID },
	currentUser: { capabilities: { [ SITE_ID ]: { manage_options: true } } },
};

describe( 'Plans page', () => {
	beforeAll( () => {
		window.scrollTo = vi.fn();
	} );

	beforeEach( () => {
		vi.clearAllMocks();
		vi.mocked( isEnabled ).mockReturnValue( false );
		vi.mocked( useCurrentPlan ).mockReturnValue( { productSlug: PLAN_STUDENT } as never );
	} );

	it( 'passes the checkout attribution to the student plans grid', () => {
		renderWithProvider(
			<PlansWrapper
				context={ { path: '/plans/example.wordpress.com' } as never }
				checkoutAttribution={ { source: 'wp_ai_credits', aiSessionId: 'abc123' } }
			/>,
			{ initialState, reducers: { ui: uiReducer, purchases: purchasesReducer } }
		);

		expect( PlansFeaturesMain ).toHaveBeenCalled();
		expect( vi.mocked( PlansFeaturesMain ).mock.lastCall?.[ 0 ] ).toMatchObject( {
			intent: 'plans-student',
			checkoutAttribution: { source: 'wp_ai_credits', aiSessionId: 'abc123' },
		} );
	} );

	it.each( [
		[ 'a standing preview', [ { blog_id: SITE_ID, site_slug: 'example.wordpress.com' } ], true ],
		[ 'an ordinary Atomic site on Free', [], undefined ],
	] )( 'adjusts checkout only for a preview (%s)', ( _, previewSites, isPreview ) => {
		vi.mocked( useCurrentPlan ).mockReturnValue( { productSlug: PLAN_FREE } as never );
		const queryClient = new QueryClient();
		queryClient.setQueryData( wowFunnelPendingQuery().queryKey, {
			pending: false,
			preview_sites: previewSites,
		} );

		renderWithProvider(
			<PlansWrapper context={ { path: '/plans/example.wordpress.com' } as never } />,
			{
				initialState: {
					...initialState,
					sites: {
						items: {
							[ SITE_ID ]: {
								...initialState.sites.items[ SITE_ID ],
								URL: 'https://example.wordpress.com',
								plan: { product_slug: PLAN_FREE, user_is_owner: true },
								options: { is_wpcom_atomic: true },
							},
						},
					},
				},
				reducers: { ui: uiReducer, purchases: purchasesReducer },
				queryClient,
			}
		);

		expect( vi.mocked( PlansFeaturesMain ).mock.lastCall?.[ 0 ] ).toMatchObject( {
			hideFreePlan: isPreview,
			redirectTo: isPreview ? '/home/example.wordpress.com?celebrateLaunch=true' : undefined,
		} );
	} );
} );
