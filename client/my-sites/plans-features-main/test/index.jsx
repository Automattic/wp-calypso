/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/components/marketing-message', () => () => null );
jest.mock( 'calypso/components/async-load', () => ( { visiblePlans } ) => (
	<div data-testid="plan-features">
		<div data-testid="visible-plans">{ JSON.stringify( visiblePlans ) }</div>
	</div>
) );
jest.mock( 'calypso/my-sites/plans-features-main/components/plan-type-selector', () => () => (
	<div>PlanTypeSelector</div>
) );
jest.mock( '../hooks/use-intent-from-site-meta', () => jest.fn() );
jest.mock( 'calypso/state/purchases/selectors', () => ( {
	getByPurchaseId: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan', () => jest.fn() );
jest.mock( 'calypso/state/selectors/can-upgrade-to-plan', () => jest.fn() );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn(),
} ) );

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
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import useIntentFromSiteMeta from '../hooks/use-intent-from-site-meta';
import PlansFeaturesMain from '../index';

const props = {
	selectedPlan: PLAN_FREE,
	translate: ( x ) => x,
};

describe( 'PlansFeaturesMain', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		useIntentFromSiteMeta.mockImplementation( () => ( {
			processing: false,
			intent: null,
		} ) );
	} );

	describe( 'PlansFeaturesMain.getPlansForPlanFeatures()', () => {
		test( 'Should render <PlanFeatures /> with default WPCOM plans when called with nullish/default intent', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } /> );
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

		test( 'Should render <PlanFeatures /> with LinkInBio plans when called with link-in-bio intent', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } intent="plans-link-in-bio" /> );
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

		test( 'Should render <PlanFeatures /> with WP.com data-e2e-plans when requested', () => {
			renderWithProvider( <PlansFeaturesMain { ...props } /> );

			expect( screen.getByTestId( 'plan-features' ).parentElement ).toHaveAttribute(
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
		};

		beforeEach( () => {
			global.document.location.search = '';
		} );

		test( 'Should render <PlanFeatures /> with tab picker when requested', () => {
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
