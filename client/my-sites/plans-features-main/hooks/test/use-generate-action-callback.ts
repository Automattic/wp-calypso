/**
 * @vitest-environment jsdom
 */
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_WOO_HOSTED_BASIC,
	PLAN_WOO_HOSTED_PRO,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import useGenerateActionCallback from '../use-generate-action-callback';
import type { CheckoutAttribution } from '../use-generate-action-callback';

vi.mock( '@automattic/calypso-router', () => ( { default: vi.fn() } ) );
vi.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: vi.fn() } ) );
vi.mock( '@automattic/help-center/src/stores', () => ( { HELP_CENTER_STORE: 'help-center' } ) );
vi.mock( '@automattic/zendesk-client', () => ( {
	useCanConnectToZendeskMessaging: () => ( { data: false } ),
} ) );
vi.mock( '@wordpress/data', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@wordpress/data' ) >() ),
	useDispatch: () => ( { setNewMessagingChat: vi.fn(), setNavigateToOdie: vi.fn() } ),
} ) );
vi.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );
vi.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: () => 'example.wordpress.com',
	getSiteUrl: () => 'https://example.wordpress.com',
	isCurrentPlanPaid: () => false,
} ) );
vi.mock( 'calypso/state/sites/plans/selectors', () => ( {
	isCurrentUserCurrentPlanOwner: () => true,
} ) );
vi.mock( 'calypso/my-sites/plans-features-main/hooks/use-free-trial-plan-slugs', () => ( {
	useFreeTrialPlanSlugs: () => ( {} ),
} ) );
vi.mock( '../use-current-plan-manage-href', () => ( { default: () => '/manage' } ) );
vi.mock( '../use-non-owner-handler', () => ( { useNonOwnerHandler: () => vi.fn() } ) );

/**
 * Click Personal on a free site's plans page and return the checkout URL it opens.
 */
async function upgradeToPersonal( props: {
	coupon?: string;
	redirectTo?: string;
	checkoutAttribution?: CheckoutAttribution;
} ): Promise< URL > {
	const { result } = renderHook( () =>
		useGenerateActionCallback( {
			currentPlan: { productSlug: PLAN_FREE } as never,
			eligibleForFreeHostingTrial: false,
			sitePlanSlug: PLAN_FREE,
			siteId: 1,
			...props,
		} )
	);

	await result.current( {
		planSlug: PLAN_PERSONAL,
		cartItemForPlan: { product_slug: PLAN_PERSONAL },
		availableForPurchase: true,
	} as never )();

	expect( page ).toHaveBeenCalledTimes( 1 );
	return new URL( ( page as unknown as Mock ).mock.calls[ 0 ][ 0 ], 'https://wordpress.com' );
}

describe( 'useGenerateActionCallback upgrade checkout URL', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'forwards purchase attribution to checkout', async () => {
		const url = await upgradeToPersonal( {
			coupon: 'SAVE10',
			redirectTo: '/home/example.wordpress.com',
			checkoutAttribution: { source: 'wpcom-mcp-plan-gate', aiSessionId: 'abc123' },
		} );

		expect( url.pathname ).toBe( `/checkout/example.wordpress.com/${ PLAN_PERSONAL }` );
		expect( Object.fromEntries( url.searchParams ) ).toEqual( {
			coupon: 'SAVE10',
			redirect_to: '/home/example.wordpress.com',
			source: 'wpcom-mcp-plan-gate',
			ai_session_id: 'abc123',
		} );
	} );

	it( 'forwards only the attribution that is present', async () => {
		const url = await upgradeToPersonal( {
			checkoutAttribution: { source: 'wpcom-mcp-plan-gate', aiSessionId: '' },
		} );

		expect( Object.fromEntries( url.searchParams ) ).toEqual( { source: 'wpcom-mcp-plan-gate' } );
	} );

	it( 'adds no attribution when none arrived', async () => {
		const url = await upgradeToPersonal( { checkoutAttribution: {} } );

		expect( url.search ).toBe( '' );
	} );
} );

describe( 'useGenerateActionCallback downgrades', () => {
	// Without it, a Woo Hosted store picking a lower plan is sent to checkout instead of support.
	it( 'sends a Woo Hosted store picking a lower plan to support, not checkout', async () => {
		vi.clearAllMocks();
		const { result } = renderHook( () =>
			useGenerateActionCallback( {
				currentPlan: { productSlug: PLAN_WOO_HOSTED_PRO } as never,
				eligibleForFreeHostingTrial: false,
				flowName: 'plan-upgrade',
				intent: 'plans-woo-hosted',
				sitePlanSlug: PLAN_WOO_HOSTED_PRO,
				siteId: 1,
			} )
		);

		await result.current( {
			planSlug: PLAN_WOO_HOSTED_BASIC,
			cartItemForPlan: { product_slug: PLAN_WOO_HOSTED_BASIC },
			availableForPurchase: false,
		} as never )();

		expect( page ).not.toHaveBeenCalled();
	} );
} );
