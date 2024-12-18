/**
 * @jest-environment jsdom
 */
import { PLAN_FREE, PLAN_PERSONAL } from '@automattic/calypso-products';
import { screen, renderHook } from '@testing-library/react';
import {
	FREE_PLAN_FREE_DOMAIN_DIALOG,
	FREE_PLAN_PAID_DOMAIN_DIALOG,
	PAID_PLAN_PAID_DOMAIN_DIALOG,
} from '..';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import { useModalResolutionCallback } from '../hooks/use-modal-resolution-callback';

function MockPlansFeaturesMain( {
	flowName,
	selectedPlan,
	paidDomainName,
	intent,
	isCustomDomainAllowedOnFreePlan = false,
}: {
	flowName?: string;
	selectedPlan: string;
	paidDomainName?: string | null;
	intent?: string | null;
	isCustomDomainAllowedOnFreePlan?: boolean | null;
} ) {
	const resolveModal = useModalResolutionCallback( {
		isCustomDomainAllowedOnFreePlan,
		flowName,
		paidDomainName,
		intent,
	} );
	return <div data-testid="modal-render">{ resolveModal( selectedPlan ) }</div>;
}

describe( 'PlanUpsellModal tests', () => {
	describe( 'Mocked PlansFeaturesMain tests', () => {
		test( 'A paid domain + the Free plan should show the FREE_PLAN_PAID_DOMAIN_DIALOG when custom domains are enabled for the Free plan', () => {
			renderWithProvider(
				<MockPlansFeaturesMain
					flowName="onboarding-pm"
					isCustomDomainAllowedOnFreePlan
					selectedPlan={ PLAN_FREE }
					paidDomainName="yourgroovydomain.com"
				/>
			);
			expect( screen.getByTestId( 'modal-render' ) ).toHaveTextContent(
				FREE_PLAN_PAID_DOMAIN_DIALOG
			);
		} );

		test( 'A free domain should show the FREE_PLAN_FREE_DOMAIN_DIALOG when custom domains are enabled for the Free plan', () => {
			renderWithProvider(
				<MockPlansFeaturesMain isCustomDomainAllowedOnFreePlan selectedPlan={ PLAN_FREE } />
			);
			expect( screen.getByTestId( 'modal-render' ) ).toHaveTextContent(
				FREE_PLAN_FREE_DOMAIN_DIALOG
			);
		} );

		test( 'A free domain on the onboarding flow should NOT show any Dialog', () => {
			renderWithProvider(
				<MockPlansFeaturesMain flowName="onboarding" selectedPlan={ PLAN_FREE } />
			);
			expect( screen.queryByText( /DIALOG/i ) ).toBeNull();
		} );

		test( 'A paid domain should show the PAID_PLAN_PAID_DOMAIN_DIALOG without custom domains enabled for the Free plan', () => {
			renderWithProvider(
				<MockPlansFeaturesMain
					flowName="onboarding"
					selectedPlan={ PLAN_FREE }
					paidDomainName="yourgroovydomain.com"
				/>
			);
			expect( screen.getByTestId( 'modal-render' ) ).toHaveTextContent(
				PAID_PLAN_PAID_DOMAIN_DIALOG
			);
		} );

		test( 'Paid plan selections should not show any modals', () => {
			/**
			 * Flow onboarding paid domain
			 */
			const { queryByText: queryByText1 } = renderWithProvider(
				<MockPlansFeaturesMain
					flowName="onboarding"
					selectedPlan={ PLAN_PERSONAL }
					paidDomainName="yourgroovydomain.com"
				/>
			);

			expect( queryByText1( /DIALOG/i ) ).toBeNull();

			/**
			 * Flow onboarding-pm paid domain
			 */
			const { queryByText: queryByText2 } = renderWithProvider(
				<MockPlansFeaturesMain
					flowName="onboarding-pm"
					selectedPlan={ PLAN_PERSONAL }
					paidDomainName="yourgroovydomain.com"
				/>
			);

			expect( queryByText2( /DIALOG/i ) ).toBeNull();

			/**
			 * Flow onboarding free domain
			 */
			const { queryByText: queryByText3 } = renderWithProvider(
				<MockPlansFeaturesMain flowName="onboarding" selectedPlan={ PLAN_PERSONAL } />
			);

			expect( queryByText3( /DIALOG/i ) ).toBeNull();

			/**
			 * Flow onboarding-pm free domain
			 */
			const { queryByText: queryByText4 } = renderWithProvider(
				<MockPlansFeaturesMain flowName="onboarding-pm" selectedPlan={ PLAN_PERSONAL } />
			);

			expect( queryByText4( /DIALOG/i ) ).toBeNull();
		} );

		test( 'A paid domain with Jetpack App intent should show the PAID_PLAN_PAID_DOMAIN_DIALOG', () => {
			renderWithProvider(
				<MockPlansFeaturesMain
					selectedPlan={ PLAN_FREE }
					paidDomainName="yourgroovydomain.com"
					intent="plans-jetpack-app-site-creation"
				/>
			);
			expect( screen.getByTestId( 'modal-render' ) ).toHaveTextContent(
				PAID_PLAN_PAID_DOMAIN_DIALOG
			);
		} );

		test( 'A free domain with Jetpack App intent should NOT show any Dialog', () => {
			renderWithProvider(
				<MockPlansFeaturesMain
					selectedPlan={ PLAN_FREE }
					intent="plans-jetpack-app-site-creation"
				/>
			);
			expect( screen.queryByText( /DIALOG/i ) ).toBeNull();
		} );
	} );

	describe( 'useModalResolutionCallback hook related tests', () => {
		test( 'Free plan and free domain selection should not show any modals on the onboarding flow when all other modals are hidden', () => {
			const { result } = renderHook( () =>
				useModalResolutionCallback( {
					isCustomDomainAllowedOnFreePlan: false,
					flowName: 'Onboarding',
					paidDomainName: null,
					intent: null,
				} )
			);
			expect( result.current( PLAN_FREE ) ).toBeNull();
		} );
	} );
} );
