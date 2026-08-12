/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/components/marketing-message', () => () => null );
jest.mock( '@automattic/plans-grid-next', () => {
	const actual = jest.requireActual( '@automattic/plans-grid-next' );

	return {
		...actual,
		FeaturesGrid: ( { gridPlans } ) => (
			<div data-testid="plan-features">
				<div data-testid="visible-plans">
					{ JSON.stringify( gridPlans.map( ( { planSlug } ) => planSlug ) ) }
				</div>
			</div>
		),
		PlanTypeSelector: () => <div>PlanTypeSelector</div>,
		useGridPlansForFeaturesGrid: jest.fn( actual.useGridPlansForFeaturesGrid ),
		usePlanFeaturesForGridPlans: jest.fn(),
		useRestructuredPlanFeaturesForComparisonGrid: jest.fn(),
	};
} );
jest.mock( '../hooks/use-plan-intent-from-site-meta', () => jest.fn() );
jest.mock( '../hooks/use-plan-from-upsells', () => jest.fn() );
jest.mock( '../hooks/use-suggested-free-domain-from-paid-domain', () => () => ( {
	wpcomFreeDomainSuggestion: { isLoading: false, result: { domain_name: 'suggestion.com' } },
	invalidateDomainSuggestionCache: () => {},
} ) );
jest.mock( '../hooks/use-renewal-price-experiment', () => ( {
	useRenewalPricingExperiment: jest.fn( () => [ false, null ] ),
} ) );
jest.mock( 'calypso/my-sites/plans-features-main/hooks/use-plans-grid-redesign-experiment', () =>
	jest.fn( () => ( {
		isLoading: false,
		variant: 'control',
		usePlansGridRedesign: false,
		showDifferentiatorHeader: false,
		showEnterpriseBottomCard: false,
		showWooCommerceBottomCard: false,
		isExperimentEligible: false,
	} ) )
);
jest.mock( 'calypso/state/purchases/selectors', () => ( {
	getByPurchaseId: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan', () => jest.fn() );
jest.mock( 'calypso/state/selectors/can-upgrade-to-plan', () => jest.fn() );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn(),
	getSelectedSite: jest.fn(),
} ) );
jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: {
		...jest.requireActual( '@automattic/data-stores' ).Plans,
		usePlans: jest.fn(),
		usePricingMetaForGridPlans: jest.fn(),
		useCurrentPlan: jest.fn(),
	},
	AddOns: {
		...jest.requireActual( '@automattic/data-stores' ).AddOns,
		useStorageAddOns: jest.fn(),
	},
} ) );

jest.mock( 'calypso/components/data/query-active-promotions', () => jest.fn() );
jest.mock( 'calypso/components/data/query-products-list', () => jest.fn() );

import {
	PLAN_FREE,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useGridPlansForFeaturesGrid } from '@automattic/plans-grid-next';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import usePlansGridRedesignExperiment from 'calypso/my-sites/plans-features-main/hooks/use-plans-grid-redesign-experiment';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import usePlanFromUpsells from '../hooks/use-plan-from-upsells';
import useIntentFromSiteMeta from '../hooks/use-plan-intent-from-site-meta';
import PlansFeaturesMain from '../index';

const props = {
	selectedPlan: PLAN_FREE,
	translate: ( x ) => x,
	hidePlansFeatureComparison: true,
};

const emptyPlansIndexForMockedFeatures = {
	[ PLAN_FREE ]: null,
	[ PLAN_PERSONAL ]: null,
	[ PLAN_PREMIUM ]: null,
	[ PLAN_BUSINESS ]: null,
	[ PLAN_ECOMMERCE ]: null,
	[ PLAN_ENTERPRISE_GRID_WPCOM ]: null,
};

describe( 'PlansFeaturesMain', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		useIntentFromSiteMeta.mockImplementation( () => ( {
			processing: false,
			intent: null,
		} ) );
		usePlanFromUpsells.mockReturnValue( null );
		getSelectedSiteId.mockImplementation( () => 123 );
		Plans.usePlans.mockImplementation( () => ( {
			isFetching: false,
			data: emptyPlansIndexForMockedFeatures,
		} ) );
		Plans.usePricingMetaForGridPlans.mockImplementation( () => emptyPlansIndexForMockedFeatures );
		Plans.useCurrentPlan.mockReturnValue( undefined );
		usePlansGridRedesignExperiment.mockImplementation( () => ( {
			isLoading: false,
			variant: 'control',
			usePlansGridRedesign: false,
			showDifferentiatorHeader: false,
			showEnterpriseBottomCard: false,
			showWooCommerceBottomCard: false,
			isExperimentEligible: false,
		} ) );
		useGridPlansForFeaturesGrid.mockImplementation(
			jest.requireActual( '@automattic/plans-grid-next' ).useGridPlansForFeaturesGrid
		);
	} );

	describe( 'PlansFeaturesMain.getPlansForPlanFeatures()', () => {
		test( 'Should render <PlanFeatures /> with default WPCOM plans', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } intent="plans-default-wpcom" /> );
			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_FREE,
					PLAN_PERSONAL,
					PLAN_PREMIUM,
					PLAN_BUSINESS,
					PLAN_ECOMMERCE,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'Should render <PlanFeatures /> with Newsletter plans when called with newsletter intent', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } intent="plans-newsletter" /> );
			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ] )
			);
		} );

		test( 'Should render <PlanFeatures /> with Newsletter plans when site with newsletter intent', () => {
			useIntentFromSiteMeta.mockImplementation( () => ( {
				processing: false,
				intent: 'plans-newsletter',
			} ) );
			renderWithProvider( <PlansFeaturesMain { ...props } /> );
			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ] )
			);
		} );

		test( 'recovers an empty Newsletter site-meta grid with default plans when enabled', () => {
			useIntentFromSiteMeta.mockImplementation( () => ( {
				processing: false,
				intent: 'plans-newsletter',
			} ) );
			renderWithProvider(
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					hideFreePlan
					hidePersonalPlan
					hidePremiumPlan
				/>
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_ENTERPRISE_GRID_WPCOM ] )
			);
		} );

		test( 'recovers a Newsletter site on Commerce to Commerce and Enterprise', () => {
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			renderWithProvider(
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					hideFreePlan
					hidePersonalPlan
					hidePremiumPlan
					hideBusinessPlan
				/>
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_ECOMMERCE, PLAN_ENTERPRISE_GRID_WPCOM ] )
			);
		} );

		test( 're-evaluates the tailored grid when hidden-plan filters change after recovery', async () => {
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			const { rerender } = renderWithProvider(
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					hideFreePlan
					hidePersonalPlan
					hidePremiumPlan
				/>
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_ENTERPRISE_GRID_WPCOM ] )
			);

			rerender(
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					hideFreePlan
					hidePersonalPlan
				/>
			);

			await waitFor( () =>
				expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
					JSON.stringify( [ PLAN_PREMIUM ] )
				)
			);
		} );

		test( 're-evaluates the tailored grid when site intent changes after recovery', async () => {
			let siteIntent = 'plans-newsletter';
			useIntentFromSiteMeta.mockImplementation( () => ( {
				processing: false,
				intent: siteIntent,
			} ) );
			useGridPlansForFeaturesGrid.mockImplementation( ( { intent } ) => {
				if ( intent === 'plans-newsletter' ) {
					return [];
				}
				return [
					{
						planSlug: intent === 'plans-videopress' ? PLAN_ECOMMERCE : PLAN_BUSINESS,
					},
				];
			} );
			const component = <PlansFeaturesMain { ...props } enableClassicPlansEmptyGridRecovery />;
			const { rerender } = renderWithProvider( component );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_BUSINESS ] )
			);

			siteIntent = 'plans-videopress';
			rerender( component );

			await waitFor( () =>
				expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
					JSON.stringify( [ PLAN_ECOMMERCE ] )
				)
			);
		} );

		test( 're-evaluates the tailored grid when selected-plan context changes after recovery', async () => {
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			useGridPlansForFeaturesGrid.mockImplementation( ( { intent, selectedPlan } ) => {
				if ( intent === 'plans-newsletter' ) {
					return selectedPlan === PLAN_BUSINESS ? [ { planSlug: PLAN_PREMIUM } ] : [];
				}
				return [ { planSlug: PLAN_BUSINESS } ];
			} );
			const { rerender } = renderWithProvider(
				<PlansFeaturesMain { ...props } enableClassicPlansEmptyGridRecovery />
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_BUSINESS ] )
			);

			rerender(
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					selectedPlan={ PLAN_BUSINESS }
				/>
			);

			await waitFor( () =>
				expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
					JSON.stringify( [ PLAN_PREMIUM ] )
				)
			);
		} );

		test( 'preserves the selected term when recovering with default plans', () => {
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			renderWithProvider(
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					intervalType="monthly"
					hideFreePlan
					hidePersonalPlan
					hidePremiumPlan
				/>
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_BUSINESS_MONTHLY,
					PLAN_ECOMMERCE_MONTHLY,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'does not recover a viable tailored grid when the current plan is unavailable', () => {
			const observedIntents = [];
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			useGridPlansForFeaturesGrid.mockImplementation( ( { intent } ) => {
				observedIntents.push( intent );
				return [ { planSlug: PLAN_PREMIUM } ];
			} );

			renderWithProvider( <PlansFeaturesMain { ...props } enableClassicPlansEmptyGridRecovery /> );

			expect( Plans.useCurrentPlan ).toHaveReturnedWith( undefined );
			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_PREMIUM ] )
			);
			expect( observedIntents ).not.toContain( 'plans-default-wpcom' );
		} );

		test( 'keeps upsell intent resolution isolated from automatic recovery', () => {
			const observedIntents = [];
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			usePlanFromUpsells.mockReturnValue( PLAN_BUSINESS );
			useGridPlansForFeaturesGrid.mockImplementation( ( { intent } ) => {
				observedIntents.push( intent );
				return [];
			} );

			renderWithProvider( <PlansFeaturesMain { ...props } enableClassicPlansEmptyGridRecovery /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent( '[]' );
			expect( observedIntents ).toContain( 'plans-default-wpcom' );
			expect( observedIntents ).not.toContain( 'plans-newsletter' );
		} );

		test( 'does not recover when bottom-card presentation removes the only grid card', () => {
			const observedIntents = [];
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			usePlansGridRedesignExperiment.mockReturnValue( {
				isLoading: false,
				variant: 'control',
				usePlansGridRedesign: false,
				showDifferentiatorHeader: false,
				showEnterpriseBottomCard: true,
				showWooCommerceBottomCard: false,
				isExperimentEligible: false,
			} );
			useGridPlansForFeaturesGrid.mockImplementation( ( { intent } ) => {
				observedIntents.push( intent );
				return [ { planSlug: PLAN_ENTERPRISE_GRID_WPCOM } ];
			} );

			renderWithProvider( <PlansFeaturesMain { ...props } enableClassicPlansEmptyGridRecovery /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent( '[]' );
			expect( observedIntents ).not.toContain( 'plans-default-wpcom' );
		} );

		test( 'keeps a viable Newsletter Premium grid in the legacy layout', () => {
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			Plans.useCurrentPlan.mockReturnValue( {
				planSlug: PLAN_PREMIUM,
				productSlug: PLAN_PREMIUM,
			} );
			renderWithProvider(
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					hideFreePlan
					hidePersonalPlan
				/>
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_PREMIUM ] )
			);
		} );

		test( 'recovers when the untangled layout removes the current Newsletter Premium plan', () => {
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			Plans.useCurrentPlan.mockReturnValue( {
				planSlug: PLAN_PREMIUM,
				productSlug: PLAN_PREMIUM,
			} );
			renderWithProvider(
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					isInSiteDashboard
					hideFreePlan
					hidePersonalPlan
				/>
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_ENTERPRISE_GRID_WPCOM ] )
			);
		} );

		test( 'does not recover an explicit intent when site metadata is also present', () => {
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			renderWithProvider(
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					intent="plans-newsletter"
					hideFreePlan
					hidePersonalPlan
					hidePremiumPlan
				/>
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent( '[]' );
		} );

		test( 'does not recover an empty site-meta grid without the classic opt-in', () => {
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			renderWithProvider(
				<PlansFeaturesMain { ...props } hideFreePlan hidePersonalPlan hidePremiumPlan />
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent( '[]' );
		} );

		test( 'does not recover while the tailored grid is loading', () => {
			const observedIntents = [];
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			useGridPlansForFeaturesGrid.mockImplementation( ( { intent } ) => {
				observedIntents.push( intent );
				return null;
			} );
			const onReady = jest.fn();

			renderWithProvider(
				<PlansFeaturesMain { ...props } enableClassicPlansEmptyGridRecovery onReady={ onReady } />
			);

			expect( screen.queryByTestId( 'plan-features' ) ).not.toBeInTheDocument();
			expect( onReady ).not.toHaveBeenCalled();
			expect( observedIntents ).not.toContain( 'plans-default-wpcom' );
		} );

		test( 'keeps the empty tailored pass unready until recovered plans load', async () => {
			let recoveredPlansLoaded = false;
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			useGridPlansForFeaturesGrid.mockImplementation( ( { intent } ) => {
				if ( intent === 'plans-newsletter' ) {
					return [];
				}
				if ( intent === 'plans-default-wpcom' && ! recoveredPlansLoaded ) {
					return null;
				}
				return [
					{ planSlug: PLAN_BUSINESS },
					{ planSlug: PLAN_ECOMMERCE },
					{ planSlug: PLAN_ENTERPRISE_GRID_WPCOM },
				];
			} );
			const onReady = jest.fn();
			const renderSiblingWhenLoaded = jest.fn( () => <div data-testid="loaded-sibling" /> );
			const component = (
				<PlansFeaturesMain
					{ ...props }
					enableClassicPlansEmptyGridRecovery
					onReady={ onReady }
					renderSiblingWhenLoaded={ renderSiblingWhenLoaded }
				/>
			);
			const { rerender } = renderWithProvider( component );

			expect( screen.queryByTestId( 'plan-features' ) ).not.toBeInTheDocument();
			expect( screen.queryByTestId( 'loaded-sibling' ) ).not.toBeInTheDocument();
			expect( onReady ).not.toHaveBeenCalled();

			recoveredPlansLoaded = true;
			rerender( component );

			await waitFor( () => expect( screen.getByTestId( 'plan-features' ) ).toBeVisible() );
			expect( screen.getByTestId( 'loaded-sibling' ) ).toBeVisible();
			expect( onReady ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'keeps the manual View all plans action independent', async () => {
			const user = userEvent.setup();
			useIntentFromSiteMeta.mockReturnValue( {
				processing: false,
				intent: 'plans-newsletter',
			} );
			renderWithProvider( <PlansFeaturesMain { ...props } enableClassicPlansEmptyGridRecovery /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ] )
			);
			await user.click( screen.getByRole( 'button', { name: 'View all plans' } ) );
			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_FREE,
					PLAN_PERSONAL,
					PLAN_PREMIUM,
					PLAN_BUSINESS,
					PLAN_ECOMMERCE,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'Should render <PlanFeatures /> with WP.com data-e2e-plans when requested', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } /> );

			// immediate parent is <div className="plans-wrapper">
			// data-e2e-plans is set on the parent of that
			expect( screen.getByTestId( 'plan-features' ).parentElement.parentElement ).toHaveAttribute(
				'data-e2e-plans',
				'wpcom'
			);
		} );

		test( 'Should render <PlanFeatures /> with monthly WP.com plans when requested', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } intervalType="monthly" /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_FREE,
					PLAN_PERSONAL_MONTHLY,
					PLAN_PREMIUM_MONTHLY,
					PLAN_BUSINESS_MONTHLY,
					PLAN_ECOMMERCE_MONTHLY,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'Should render <PlanFeatures /> with WP.com 2-year plans when requested ( by plan )', () => {
			renderWithProvider(
				<PlansFeaturesMain
					{ ...props }
					selectedPlan={ PLAN_PERSONAL_2_YEARS }
					intervalType={ null }
				/>
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_FREE,
					PLAN_PERSONAL_2_YEARS,
					PLAN_PREMIUM_2_YEARS,
					PLAN_BUSINESS_2_YEARS,
					PLAN_ECOMMERCE_2_YEARS,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'Should render <PlanFeatures /> with WP.com 2-year plans when requested ( by interval )', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } intervalType="2yearly" /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_FREE,
					PLAN_PERSONAL_2_YEARS,
					PLAN_PREMIUM_2_YEARS,
					PLAN_BUSINESS_2_YEARS,
					PLAN_ECOMMERCE_2_YEARS,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );
	} );

	describe( 'PlansFeaturesMain. Downgrade flow (plans-upgrade-or-downgrade intent)', () => {
		// The dashboard "Change plan" button sends owners to the plan-upgrade
		// stepper flow with allow_downgrade=true, which resolves to the
		// 'plans-upgrade-or-downgrade' intent. Unlike 'plans-upgrade', that intent
		// must keep lower-tier plans visible so the user can downgrade. These tests
		// guard that behavior against Plans page UX changes.
		beforeEach( () => {
			Plans.useCurrentPlan.mockImplementation( () => ( { planSlug: PLAN_BUSINESS } ) );
		} );

		test( 'shows lower-tier plans (below the current plan) for the downgrade intent', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } intent="plans-upgrade-or-downgrade" /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_FREE,
					PLAN_PERSONAL,
					PLAN_PREMIUM,
					PLAN_BUSINESS,
					PLAN_ECOMMERCE,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'hides lower-tier plans for the upgrade-only intent (contrast)', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } intent="plans-upgrade" /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [ PLAN_BUSINESS, PLAN_ECOMMERCE, PLAN_ENTERPRISE_GRID_WPCOM ] )
			);
		} );
	} );

	describe( 'PlansFeaturesMain. Plan exclusion props', () => {
		test( 'Should render <PlanFeatures /> removing the free plan when hideFreePlan prop is present, regardless of its position', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } hideFreePlan /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_PERSONAL,
					PLAN_PREMIUM,
					PLAN_BUSINESS,
					PLAN_ECOMMERCE,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'Should render <PlanFeatures /> removing the Personal plan when hidePersonalPlan prop is present, regardless of its position', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } hidePersonalPlan /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_FREE,
					PLAN_PREMIUM,
					PLAN_BUSINESS,
					PLAN_ECOMMERCE,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'Should render <PlanFeatures /> removing the Premium plan when hidePremiumPlan prop is present, regardless of its position', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } hidePremiumPlan /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_FREE,
					PLAN_PERSONAL,
					PLAN_BUSINESS,
					PLAN_ECOMMERCE,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'Should render <PlanFeatures /> with the Personal plan and the Premium plan when hidePersonalPlan and hidePremiumPlan are false.', () => {
			renderWithProvider(
				<PlansFeaturesMain { ...props } hidePersonalPlan={ false } hidePremiumPlan={ false } />
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_FREE,
					PLAN_PERSONAL,
					PLAN_PREMIUM,
					PLAN_BUSINESS,
					PLAN_ECOMMERCE,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );
	} );

	describe( 'PlansFeaturesMain.getPlansForPlanFeatures() with tabs', () => {
		const myProps = {
			selectedPlan: PLAN_FREE,
			translate: ( x ) => x,
			hideFreePlan: true,
			withWPPlanTabs: true,
			planTypeSelector: null,
			hidePlansFeatureComparison: true,
		};

		beforeEach( () => {
			global.document.location.search = '';
		} );

		test( 'Should render <PlanFeatures /> with tab picker when requested', () => {
			renderWithProvider( <PlansFeaturesMain { ...myProps } /> );

			expect( screen.getByText( 'PlanTypeSelector' ) ).toBeVisible();
		} );

		test( 'Should hide the plan type selector for redesign variants in signup', () => {
			usePlansGridRedesignExperiment.mockImplementation( () => ( {
				isLoading: false,
				variant: 'six_plan_new_design',
				usePlansGridRedesign: true,
				showDifferentiatorHeader: false,
				showEnterpriseBottomCard: false,
				showWooCommerceBottomCard: false,
				isExperimentEligible: true,
			} ) );

			renderWithProvider( <PlansFeaturesMain { ...myProps } flowName="onboarding" isInSignup /> );

			expect( screen.queryByText( 'PlanTypeSelector' ) ).not.toBeInTheDocument();
		} );

		test( 'Should keep the plan type selector visible for redesign variants outside signup', () => {
			usePlansGridRedesignExperiment.mockImplementation( () => ( {
				isLoading: false,
				variant: 'six_plan_new_design',
				usePlansGridRedesign: true,
				showDifferentiatorHeader: false,
				showEnterpriseBottomCard: false,
				showWooCommerceBottomCard: false,
				isExperimentEligible: true,
			} ) );

			renderWithProvider( <PlansFeaturesMain { ...myProps } /> );

			expect( screen.getByText( 'PlanTypeSelector' ) ).toBeVisible();
		} );

		test( 'Should display proper plans in personal tab', () => {
			renderWithProvider( <PlansFeaturesMain { ...myProps } customerType="personal" /> );

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_PERSONAL,
					PLAN_PREMIUM,
					PLAN_BUSINESS,
					PLAN_ECOMMERCE,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );

		test( 'Should display proper plans in personal tab (2y)', () => {
			renderWithProvider(
				<PlansFeaturesMain { ...myProps } customerType="personal" intervalType="2yearly" />
			);

			expect( screen.getByTestId( 'visible-plans' ) ).toHaveTextContent(
				JSON.stringify( [
					PLAN_PERSONAL_2_YEARS,
					PLAN_PREMIUM_2_YEARS,
					PLAN_BUSINESS_2_YEARS,
					PLAN_ECOMMERCE_2_YEARS,
					PLAN_ENTERPRISE_GRID_WPCOM,
				] )
			);
		} );
	} );
} );
