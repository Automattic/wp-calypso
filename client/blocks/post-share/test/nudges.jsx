/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'calypso/blocks/upsell-nudge', () => ( {
	__esModule: true,
	default: ( { plan } ) => <div data-testid="upsell-nudge-plan">{ plan }</div>,
} ) );
jest.mock( 'calypso/state/selectors/can-current-user', () => ( {
	canCurrentUser: jest.fn(),
} ) );
jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: {
		...jest.requireActual( '@automattic/data-stores' ).Plans,
		usePlans: jest.fn(),
		useCurrentPlan: jest.fn(),
		usePricingMetaForGridPlans: jest.fn(),
	},
} ) );
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	findFirstSimilarPlanKey: jest.fn(),
} ) );

import {
	PLAN_FREE,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	findFirstSimilarPlanKey,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { UpgradeToPremiumNudge } from '../nudges';

const props = {
	siteId: undefined,
};

const Wrapper = ( { children } ) => {
	const queryClient = useMemo( () => new QueryClient(), [] );
	const store = createReduxStore();

	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</ReduxProvider>
	);
};

describe( 'UpgradeToPremiumNudge basic tests', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		findFirstSimilarPlanKey.mockImplementation( () => PLAN_PREMIUM );
		Plans.useCurrentPlan.mockImplementation( () => ( { planSlug: PLAN_PERSONAL } ) );
		Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
			[ PLAN_PREMIUM ]: {
				originalPrice: { full: 24000, monthly: 2000 },
				discountedPrice: { full: 12000, monthly: 1000 },
				currencyCode: 'USD',
			},
		} ) );
	} );

	test( 'should not blow up', () => {
		canCurrentUser.mockReturnValue( true );
		render( <UpgradeToPremiumNudge { ...props } />, { wrapper: Wrapper } );
		expect( screen.getByTestId( 'upsell-nudge-plan' ) ).toBeVisible();
	} );

	test( 'hide when user cannot upgrade', () => {
		canCurrentUser.mockReturnValue( false );
		render( <UpgradeToPremiumNudge { ...props } />, { wrapper: Wrapper } );
		expect( screen.queryByTestId( 'upsell-nudge-plan' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'UpgradeToPremiumNudge - upsell-nudge', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		Plans.useCurrentPlan.mockImplementation( () => ( { planSlug: PLAN_PERSONAL } ) );
		canCurrentUser.mockReturnValue( true );
	} );

	[
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_FREE,
		PLAN_BLOGGER,
		PLAN_PERSONAL,
		PLAN_PREMIUM,
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_ECOMMERCE,
		PLAN_BLOGGER_2_YEARS,
		PLAN_PERSONAL_2_YEARS,
		PLAN_PREMIUM_2_YEARS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE_2_YEARS,
	].forEach( ( plan ) => {
		test( `Should pass 2-years wp.com premium plan for 2-years plans ${ plan }`, () => {
			/**
			 * These act as sending directly the plan to the upsell component,
			 * bypassing findFirstSimilarPlanKey logic (which is an imported utility)
			 */
			findFirstSimilarPlanKey.mockImplementation( () => plan );
			Plans.usePricingMetaForGridPlans.mockImplementation( () => ( {
				[ plan ]: {
					originalPrice: { full: 24000, monthly: 2000 },
					discountedPrice: { full: 12000, monthly: 1000 },
					currencyCode: 'USD',
				},
			} ) );

			render( <UpgradeToPremiumNudge { ...props } />, { wrapper: Wrapper } );
			expect( screen.getByTestId( 'upsell-nudge-plan' ) ).toHaveTextContent( plan );
		} );
	} );
} );
