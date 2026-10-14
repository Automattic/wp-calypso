/**
 * @jest-environment jsdom
 */
import { DOMAIN_FLOW, LAUNCH_SITE_FLOW, ONBOARDING_FLOW } from '@automattic/onboarding';
import { screen, waitFor } from '@testing-library/react';
import { renderStep } from '../../test/helpers';
import UnifiedPlansStep, { type UnifiedPlansStepProps } from '../unified-plans-step';

let mockPlansFeaturesMainProps: Record< string, unknown > = {};

jest.mock( 'calypso/my-sites/plans-features-main', () => ( {
	__esModule: true,
	default: ( props: Record< string, unknown > ) => {
		mockPlansFeaturesMainProps = props;
		return null;
	},
} ) );
jest.mock(
	'calypso/signup/step-wrapper',
	() =>
		( { stepContent }: { stepContent: React.ReactNode } ) =>
			stepContent
);
jest.mock( 'calypso/components/marketing-message', () => () => null );
jest.mock( 'calypso/lib/wp', () => ( { req: { post: () => {} } } ) );

const noop = () => {};

const renderV2Step = ( {
	flowName,
	paidDomainName,
	useStepContainerV2 = true,
}: {
	flowName: string;
	paidDomainName?: string;
	useStepContainerV2?: boolean;
} ) => {
	const props = {
		flowName,
		stepName: 'plans',
		goToNextStep: noop,
		submitSignupStep: noop,
		saveSignupStep: noop,
		signupDependencies: {
			domainItem: paidDomainName ? { meta: paidDomainName } : undefined,
		},
		deemphasizeFreePlan: true,
		useStepContainerV2,
		wrapperProps: { goBack: noop },
	} as unknown as UnifiedPlansStepProps;

	return renderStep( <UnifiedPlansStep { ...props } /> );
};

describe( 'UnifiedPlansStep free plan CTA', () => {
	beforeEach( () => {
		mockPlansFeaturesMainProps = {};
	} );

	describe( 'launch-site flow', () => {
		it( 'offers the free plan in the heading without a paid domain', () => {
			renderV2Step( { flowName: LAUNCH_SITE_FLOW } );

			expect( screen.getByText( /start with a free plan/i ) ).toBeVisible();
			expect( mockPlansFeaturesMainProps.renderFreePlanCtaInStepContainerV2 ).toBe( false );
			expect( mockPlansFeaturesMainProps.isInStepContainerV2 ).toBe( true );
		} );

		it( 'hands the free plan CTA to the plans grid with a paid domain', () => {
			renderV2Step( { flowName: LAUNCH_SITE_FLOW, paidDomainName: 'example.com' } );

			expect( screen.queryByText( /start with a free plan/i ) ).not.toBeInTheDocument();
			expect( mockPlansFeaturesMainProps.renderFreePlanCtaInStepContainerV2 ).toBe( true );
		} );

		it( 'tells the plans grid that legacy /start/launch-site is not in StepContainerV2', async () => {
			renderV2Step( { flowName: LAUNCH_SITE_FLOW, useStepContainerV2: false } );

			await waitFor( () => expect( mockPlansFeaturesMainProps.isInStepContainerV2 ).toBe( false ) );
		} );
	} );

	describe( 'other flows', () => {
		it( 'offers the free plan in the heading for the domain flow without a paid domain', () => {
			renderV2Step( { flowName: DOMAIN_FLOW } );

			expect( screen.getByText( /start with a free plan/i ) ).toBeInTheDocument();
			expect( mockPlansFeaturesMainProps.renderFreePlanCtaInStepContainerV2 ).toBe( false );
		} );

		it( 'hands the free plan CTA to the plans grid for onboarding with a paid domain', () => {
			renderV2Step( { flowName: ONBOARDING_FLOW, paidDomainName: 'example.com' } );

			expect( screen.queryByText( /start with a free plan/i ) ).not.toBeInTheDocument();
			expect( mockPlansFeaturesMainProps.renderFreePlanCtaInStepContainerV2 ).toBe( true );
		} );
	} );
} );
