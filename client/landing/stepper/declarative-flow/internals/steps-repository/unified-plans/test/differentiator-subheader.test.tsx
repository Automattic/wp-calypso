/**
 * @jest-environment jsdom
 */
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { act, screen } from '@testing-library/react';
import { renderStep } from '../../test/helpers';
import UnifiedPlansStep, { type UnifiedPlansStepProps } from '../unified-plans-step';
import type { PlansIntent } from '@automattic/plans-grid-next';

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
const GENERIC_SUBHEADER = /Whatever site you/;
const WEBSITE_BUILDER_SUBHEADER = /Everything you need to go from idea/;
const WEBSITE_BUILDER_HEADER = /Create a beautiful WordPress website/;
const DEFAULT_HEADER = /There’s a plan for you/;

const renderOnboardingStep = ( intent?: PlansIntent ) => {
	const props = {
		flowName: ONBOARDING_FLOW,
		stepName: 'plans',
		goToNextStep: noop,
		submitSignupStep: noop,
		saveSignupStep: noop,
		signupDependencies: {},
		useStepContainerV2: true,
		wrapperProps: { goBack: noop },
		intent,
	} as unknown as UnifiedPlansStepProps;

	return renderStep( <UnifiedPlansStep { ...props } /> );
};

const resolveIntent = ( intent: PlansIntent ) => {
	act( () => {
		( mockPlansFeaturesMainProps.onIntentResolved as ( intent: PlansIntent ) => void )( intent );
	} );
};

describe( 'UnifiedPlansStep differentiator subheader', () => {
	beforeEach( () => {
		mockPlansFeaturesMainProps = {};
	} );

	it( 'leaves the heading subtext empty until the plans grid resolves the intent', () => {
		renderOnboardingStep();

		expect( mockPlansFeaturesMainProps.onIntentResolved ).toEqual( expect.any( Function ) );
		expect( screen.queryByText( GENERIC_SUBHEADER ) ).not.toBeInTheDocument();
	} );

	it( 'hides the generic subtext when the grid resolves the default intent', () => {
		renderOnboardingStep();

		resolveIntent( 'plans-default-wpcom' );

		expect( screen.queryByText( GENERIC_SUBHEADER ) ).not.toBeInTheDocument();
	} );

	it( 'shows the generic subtext when the grid resolves a tailored intent', () => {
		renderOnboardingStep();

		resolveIntent( 'plans-newsletter' );

		expect( screen.getByText( GENERIC_SUBHEADER ) ).toBeVisible();
	} );

	it( 'follows the grid when the resolved intent changes', () => {
		renderOnboardingStep();

		resolveIntent( 'plans-newsletter' );
		expect( screen.getByText( GENERIC_SUBHEADER ) ).toBeVisible();

		resolveIntent( 'plans-default-wpcom' );
		expect( screen.queryByText( GENERIC_SUBHEADER ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the intent-specific copy when the grid resolves the same intent', () => {
		renderOnboardingStep( 'plans-website-builder' );

		resolveIntent( 'plans-website-builder' );

		expect( screen.getByText( WEBSITE_BUILDER_HEADER ) ).toBeVisible();
		expect( screen.getByText( WEBSITE_BUILDER_SUBHEADER ) ).toBeVisible();
	} );

	it( 'drops the intent-specific copy when the grid overrides the intent with the default', () => {
		renderOnboardingStep( 'plans-website-builder' );

		resolveIntent( 'plans-default-wpcom' );

		expect( screen.getByText( DEFAULT_HEADER ) ).toBeVisible();
		expect( screen.queryByText( WEBSITE_BUILDER_SUBHEADER ) ).not.toBeInTheDocument();
		expect( screen.queryByText( GENERIC_SUBHEADER ) ).not.toBeInTheDocument();
	} );
} );
