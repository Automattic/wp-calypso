/** @jest-environment jsdom */
// @ts-nocheck - TODO: Fix TypeScript issues
jest.mock( 'calypso/signup/step-wrapper', () => () => <div data-testid="start-step-wrapper" /> );
jest.mock( '@automattic/onboarding/src/step-container', () => () => (
	<div data-testid="stepper-step-wrapper" />
) );
jest.mock( 'calypso/components/marketing-message', () => 'marketing-message' );
jest.mock( 'calypso/lib/wp', () => ( { req: { post: () => {} } } ) );
jest.mock( 'calypso/my-sites/plans-features-main', () => () => (
	<div data-testid="plans-features-main" />
) );
jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-plans-grid-redesign-experiment',
	() => ( {
		__esModule: true,
		default: jest.fn( () => ( {
			isLoading: false,
			variant: 'control',
			usePlansGridRedesign: false,
			usePlansGridRedesignNewDescription: false,
			showDifferentiatorHeader: false,
			usePlansGridRedesignFeatures: false,
			showEnterpriseBottomCard: false,
			showWooCommerceBottomCard: false,
			isExperimentEligible: false,
		} ) ),
	} )
);

import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import usePlansGridRedesignExperiment from 'calypso/my-sites/plans-features-main/hooks/use-plans-grid-redesign-experiment';
import { renderStep } from '../../test/helpers';
import UnifiedPlansStep, { type UnifiedPlansStepProps } from '../unified-plans-step';

const noop = () => {};
const mockUsePlansGridRedesignExperiment = usePlansGridRedesignExperiment as jest.Mock;

const getPlansGridRedesignExperimentResult = ( overrides = {} ) => ( {
	isLoading: false,
	variant: 'control',
	usePlansGridRedesign: false,
	usePlansGridRedesignNewDescription: false,
	showDifferentiatorHeader: false,
	usePlansGridRedesignFeatures: false,
	showEnterpriseBottomCard: false,
	showWooCommerceBottomCard: false,
	isExperimentEligible: false,
	...overrides,
} );

const props = {
	flowName: 'Flow name',
	stepName: 'Step name',
	stepSectionName: 'Step section name',
	signupDependencies: { domainItem: null },
	saveSignupStep: noop,
	submitSignupStep: noop,
	goToNextStep: noop,
	onPlanIntervalUpdate: noop,
	wrapperProps: {
		hideBack: false,
		goBack: noop,
		isFullLayout: true,
		isExtraWideLayout: true,
	},
};

const _render = ( props: UnifiedPlansStepProps ) => {
	return renderStep( <UnifiedPlansStep { ...props } /> );
};

describe( 'Plans basic tests', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUsePlansGridRedesignExperiment.mockReturnValue( getPlansGridRedesignExperimentResult() );
	} );

	test( 'should not blow up in Start and have proper CSS class', async () => {
		_render( props );
		const stepWrapper = await waitFor( () => screen.getByTestId( 'start-step-wrapper' ) );
		expect( stepWrapper ).toBeVisible();
		expect( stepWrapper.parentNode ).toHaveClass( 'plans-step' );
	} );

	test( 'should not blow up in Stepper and have proper CSS class', async () => {
		_render( { ...props, useStepperWrapper: true } );
		const stepWrapper = await waitFor( () => screen.getByTestId( 'stepper-step-wrapper' ) );
		expect( stepWrapper ).toBeVisible();
		expect( stepWrapper.parentNode ).toHaveClass( 'plans-step' );
	} );

	test( 'does not show the onboarding fallback subheader when redesigned differentiators are shown', async () => {
		mockUsePlansGridRedesignExperiment.mockReturnValue(
			getPlansGridRedesignExperimentResult( {
				variant: 'six_plan_new_features',
				usePlansGridRedesign: true,
				showDifferentiatorHeader: true,
				usePlansGridRedesignFeatures: true,
				isExperimentEligible: true,
			} )
		);

		_render( {
			...props,
			flowName: 'onboarding',
			useStepContainerV2: true,
		} );

		await waitFor( () => screen.getByTestId( 'plans-features-main' ) );

		expect(
			screen.queryByText(
				'Whatever site you’re building, there’s a plan to make it happen sooner.'
			)
		).not.toBeInTheDocument();
	} );
} );
