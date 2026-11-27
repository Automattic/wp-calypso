/**
 * @vitest-environment jsdom
 */
import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import usePlansGridRedesignExperiment from 'calypso/my-sites/plans-features-main/hooks/use-plans-grid-redesign-experiment';
import MigrationPlansGrid from '..';

let mockFeaturesGridProps: Record< string, unknown > = {};
const mockUseGridPlansForFeaturesGrid = vi.fn();

vi.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: { isEnabled: () => true },
	isEnabled: () => true,
} ) );
vi.mock( '@automattic/data-stores', () => ( {
	Plans: { useCurrentPlan: () => undefined },
} ) );
vi.mock( '@automattic/plans-grid-next', () => ( {
	FeaturesGrid: ( props: Record< string, unknown > ) => {
		mockFeaturesGridProps = props;
		return <div data-testid="features-grid" />;
	},
	PlanTypeSelector: () => <div data-testid="plan-type-selector" />,
	useGridPlansForFeaturesGrid: ( params: unknown ) => mockUseGridPlansForFeaturesGrid( params ),
	usePlanBillingPeriod: () => 'TERM_ANNUALLY',
} ) );
vi.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: vi.fn() } ) );
vi.mock(
	'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase',
	() => ( { default: vi.fn() } )
);
vi.mock( 'calypso/my-sites/plans-features-main/hooks/use-free-trial-plan-slugs', () => ( {
	useFreeTrialPlanSlugs: vi.fn(),
} ) );
vi.mock( 'calypso/my-sites/plans-features-main/hooks/use-generate-action-hook', () => ( {
	default: () => vi.fn(),
} ) );
vi.mock( 'calypso/my-sites/plans-features-main/hooks/use-plans-grid-redesign-experiment', () => ( {
	default: vi.fn(),
} ) );

const mockUsePlansGridRedesignExperiment = usePlansGridRedesignExperiment as Mock;

const REDESIGN_RESULT = {
	isLoading: false,
	usePlansGridRedesign: true,
	usePlansGridRedesignNewDescription: true,
	showDifferentiatorHeader: false,
	usePlansGridRedesignFeatures: true,
	showEnterpriseBottomCard: false,
	showWooCommerceBottomCard: false,
};

const renderGrid = () => render( <MigrationPlansGrid siteId={ 123 } onUpgradeClick={ vi.fn() } /> );

describe( 'MigrationPlansGrid', () => {
	beforeEach( () => {
		mockFeaturesGridProps = {};
		mockUseGridPlansForFeaturesGrid.mockReset();
		mockUseGridPlansForFeaturesGrid.mockReturnValue( [ { planSlug: PLAN_BUSINESS } ] );
		mockUsePlansGridRedesignExperiment.mockReturnValue( REDESIGN_RESULT );
	} );

	it( 'asks the redesign hook for the migration intent in signup', () => {
		renderGrid();

		expect( mockUsePlansGridRedesignExperiment ).toHaveBeenCalledWith( {
			isInSignup: true,
			intent: 'plans-migration',
		} );
	} );

	it( 'requests the redesigned features and taglines for the grid plans', () => {
		renderGrid();

		expect( mockUseGridPlansForFeaturesGrid ).toHaveBeenCalledWith(
			expect.objectContaining( {
				intent: 'plans-migration',
				usePlansGridRedesignFeatures: true,
				usePlansGridRedesignNewDescription: true,
			} )
		);
	} );

	it( 'renders the grid with checkmarks and the redesign styling', () => {
		renderGrid();

		expect( screen.getByTestId( 'features-grid' ) ).toBeVisible();
		expect( mockFeaturesGridProps.showFeatureCheckmarks ).toBe( true );
		expect( mockFeaturesGridProps.className ).toContain( 'is-plans-grid-redesign-experiment' );
	} );

	it( 'keeps the plan type selector with the redesign, since the grid upgrades an existing site', () => {
		renderGrid();

		expect( screen.getByTestId( 'plan-type-selector' ) ).toBeVisible();
	} );

	it( 'renders without the redesign styling when the redesign is off', () => {
		mockUsePlansGridRedesignExperiment.mockReturnValue( {
			...REDESIGN_RESULT,
			usePlansGridRedesign: false,
			usePlansGridRedesignFeatures: false,
			usePlansGridRedesignNewDescription: false,
		} );

		renderGrid();

		expect( screen.getByTestId( 'plan-type-selector' ) ).toBeVisible();
		expect( mockFeaturesGridProps.showFeatureCheckmarks ).toBe( false );
		expect( mockFeaturesGridProps.className ).not.toContain( 'is-plans-grid-redesign-experiment' );
	} );
} );
