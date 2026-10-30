/**
 * @jest-environment jsdom
 */
let mockIsCurrentPlanPaid = false;
let mockIsCurrentPlanOwner = true;

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '@automattic/help-center/src/stores', () => ( { HELP_CENTER_STORE: 'help-center' } ) );
jest.mock( '@automattic/zendesk-client', () => ( {
	useCanConnectToZendeskMessaging: () => ( { data: false } ),
} ) );
// Override only useDispatch; read everything else lazily, because @wordpress/data
// is still mid-load (circular imports) when this factory runs.
jest.mock(
	'@wordpress/data',
	() =>
		new Proxy(
			{},
			{
				get: ( _target, key ) =>
					'useDispatch' === key
						? () => ( { setNewMessagingChat: jest.fn(), setNavigateToOdie: jest.fn() } )
						: jest.requireActual( '@wordpress/data' )[ key ],
			}
		)
);
jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: () => 'example.wordpress.com',
	getSiteUrl: () => 'https://example.wordpress.com',
	isCurrentPlanPaid: () => mockIsCurrentPlanPaid,
} ) );
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	isCurrentUserCurrentPlanOwner: () => mockIsCurrentPlanOwner,
} ) );
jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-free-trial-plan-slugs', () => ( {
	useFreeTrialPlanSlugs: () => ( {} ),
} ) );
jest.mock( '../use-current-plan-manage-href', () => () => '/manage' );

import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_WOO_HOSTED_BASIC,
	PLAN_WOO_HOSTED_PRO,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { renderHook } from '@testing-library/react';
import useGenerateActionCallback from '../use-generate-action-callback';
import type { CheckoutAttribution } from '../use-generate-action-callback';

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
	return new URL( ( page as unknown as jest.Mock ).mock.calls[ 0 ][ 0 ], 'https://wordpress.com' );
}

describe( 'useGenerateActionCallback upgrade checkout URL', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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
		jest.clearAllMocks();
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

describe( "useGenerateActionCallback for someone who isn't the plan owner", () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsCurrentPlanPaid = true;
		mockIsCurrentPlanOwner = false;
	} );

	afterEach( () => {
		mockIsCurrentPlanPaid = false;
		mockIsCurrentPlanOwner = true;
	} );

	it( 'does nothing, since only the owner can change the plan', async () => {
		const { result } = renderHook( () =>
			useGenerateActionCallback( {
				currentPlan: { productSlug: PLAN_PERSONAL } as never,
				eligibleForFreeHostingTrial: false,
				sitePlanSlug: PLAN_PERSONAL,
				siteId: 1,
			} )
		);

		await result.current( {
			planSlug: PLAN_PREMIUM,
			cartItemForPlan: { product_slug: PLAN_PREMIUM },
			availableForPurchase: true,
		} as never )();

		expect( page ).not.toHaveBeenCalled();
	} );
} );
