/**
 * @jest-environment jsdom
 */
import { PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS } from '@automattic/calypso-products';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import PlansStepAdaptor from '../index';

let mockReceivedProps: Record< string, unknown > = {};
let mockSite: { plan: { product_slug: string } } | null = null;

jest.mock( '../unified-plans-step', () => ( {
	__esModule: true,
	default: ( props: Record< string, unknown > ) => {
		mockReceivedProps = props;
		return null;
	},
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: () => null,
} ) );

jest.mock( 'calypso/components/data/query-theme', () => ( {
	useQueryTheme: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-blueprint-suggested-plans', () => ( {
	useBlueprintSuggestedPlans: () => ( { suggestedPlans: [], isLoading: false } ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => mockSite,
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-slug', () => ( {
	useSiteSlug: () => 'example.wordpress.com',
} ) );

jest.mock( 'calypso/lib/plans/use-visual-split-experiment', () => ( {
	useIsVisualSplitEnabled: () => [ false, null ],
} ) );

const renderAdaptor = ( extraProps: Record< string, unknown > = {}, search?: string ) => {
	const props = {
		flow: 'launch-site',
		stepName: 'plans',
		navigation: { submit: jest.fn(), goBack: jest.fn() },
		...extraProps,
	} as unknown as Parameters< typeof PlansStepAdaptor >[ 0 ];

	if ( search ) {
		window.history.replaceState( {}, '', `/setup/${ props.flow }/plans${ search }` );
	}

	return render(
		<MemoryRouter>
			<PlansStepAdaptor { ...props } />
		</MemoryRouter>
	);
};

describe( 'PlansStepAdaptor launch props', () => {
	beforeEach( () => {
		mockReceivedProps = {};
	} );

	it( 'forwards the launch page props to the plans grid', () => {
		renderAdaptor( {
			isLaunchPage: true,
			isCustomDomainAllowedOnFreePlan: true,
			deemphasizeFreePlan: true,
		} );

		expect( mockReceivedProps ).toEqual(
			expect.objectContaining( {
				isLaunchPage: true,
				isCustomDomainAllowedOnFreePlan: true,
				deemphasizeFreePlan: true,
			} )
		);
	} );
} );

describe( 'PlansStepAdaptor downgrade term', () => {
	beforeEach( () => {
		mockReceivedProps = {};
		mockSite = { plan: { product_slug: PLAN_PREMIUM } };
	} );

	afterEach( () => {
		window.history.replaceState( {}, '', '/' );
		mockSite = null;
	} );

	it( 'opens on the billing term in the link', () => {
		renderAdaptor( { flow: 'plan-upgrade' }, '?allow_downgrade=true&intervalType=monthly' );

		expect( mockReceivedProps.intervalType ).toBe( 'monthly' );
	} );

	it( "opens on the current plan's billing term when the link does not include one", () => {
		mockSite = { plan: { product_slug: PLAN_PREMIUM_2_YEARS } };
		renderAdaptor( { flow: 'plan-upgrade' }, '?allow_downgrade=true' );

		expect( mockReceivedProps.intervalType ).toBe( '2yearly' );
	} );

	it( "opens on the current plan's billing term when the link's billing term is invalid", () => {
		mockSite = { plan: { product_slug: PLAN_PREMIUM_2_YEARS } };
		renderAdaptor( { flow: 'plan-upgrade' }, '?allow_downgrade=true&intervalType=foo' );

		expect( mockReceivedProps.intervalType ).toBe( '2yearly' );
	} );

	it( 'leaves the billing term to the link on the upgrade page', () => {
		renderAdaptor( { flow: 'plan-upgrade' }, '?intervalType=monthly' );

		expect( mockReceivedProps.selectedSite ).toBe( mockSite );
		expect( mockReceivedProps.intervalType ).toBeUndefined();
	} );
} );
