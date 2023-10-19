/**
 * @jest-environment jsdom
 */
import { PLAN_FREE, PLAN_PERSONAL } from '@automattic/calypso-products';
import { screen, renderHook } from '@testing-library/react';
import useIsFreeDomainFreePlanUpsellEnabled from 'calypso/my-sites/plans-features-main/hooks/use-is-free-domain-free-plan-upsell-enabled';
import useIsFreePlanCustomDomainUpsellEnabled from 'calypso/my-sites/plans-features-main/hooks/use-is-free-plan-custom-domain-upsell-enabled';
import {
	FREE_PLAN_FREE_DOMAIN_DIALOG,
	FREE_PLAN_PAID_DOMAIN_DIALOG,
	PAID_PLAN_IS_REQUIRED_DIALOG,
} from '..';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import { useModalResolutionCallback } from '../hooks/use-modal-resolution-callback';

function MockPlansFeaturesMain( {
	flowName,
	selectedPlan,
	paidDomain,
}: {
	flowName: string;
	selectedPlan: string;
	paidDomain?: string | null;
} ) {
	const isCustomDomainAllowedOnFreePlan = useIsFreePlanCustomDomainUpsellEnabled(
		flowName,
		paidDomain
	);
	const isPlanUpsellEnabledOnFreeDomain = useIsFreeDomainFreePlanUpsellEnabled(
		flowName,
		paidDomain
	);
	const resolveModal = useModalResolutionCallback( {
		isCustomDomainAllowedOnFreePlan,
		isPlanUpsellEnabledOnFreeDomain,
		flowName,
		paidDomain,
	} );
	return <div data-testid="modal-render">{ resolveModal( selectedPlan ) }</div>;
}

describe( 'PlanUpsellModal tests', () => {
	describe( 'Mocked PlansFeaturesMain tests', () => {
		test( 'A paid domain on the onboarding-pm flow should show the FREE_PLAN_PAID_DOMAIN_DIALOG', () => {
			renderWithProvider(
				<MockPlansFeaturesMain
					flowName="onboarding-pm"
					selectedPlan={ PLAN_FREE }
					paidDomain="yourgroovydomain.com"
				/>
			);
			expect( screen.getByTestId( 'modal-render' ) ).toHaveTextContent(
				FREE_PLAN_PAID_DOMAIN_DIALOG
			);
		} );

		test( 'A free domain on the onboarding-pm flow should show the FREE_PLAN_FREE_DOMAIN_DIALOG', () => {
			renderWithProvider(
				<MockPlansFeaturesMain flowName="onboarding-pm" selectedPlan={ PLAN_FREE } />
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

		test( 'A paid domain on the onboarding flow should show the PAID_PLAN_IS_REQUIRED_DIALOG', () => {
			renderWithProvider(
				<MockPlansFeaturesMain
					flowName="onboarding"
					selectedPlan={ PLAN_FREE }
					paidDomain="yourgroovydomain.com"
				/>
			);
			expect( screen.getByTestId( 'modal-render' ) ).toHaveTextContent(
				PAID_PLAN_IS_REQUIRED_DIALOG
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
					paidDomain="yourgroovydomain.com"
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
					paidDomain="yourgroovydomain.com"
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
	} );

	describe( 'useModalResolutionCallback hook related tests', () => {
		test( 'Free plan and free domain selection should not show any modals on the onboarding flow when all other modals are hidden', () => {
			const { result } = renderHook( () =>
				useModalResolutionCallback( {
					isCustomDomainAllowedOnFreePlan: { result: false, isLoading: false },
					isPlanUpsellEnabledOnFreeDomain: { result: false, isLoading: false },
					flowName: 'Onboarding',
					paidDomain: null,
				} )
			);
			expect( result.current( PLAN_FREE ) ).toBeNull();
		} );
	} );
} );
