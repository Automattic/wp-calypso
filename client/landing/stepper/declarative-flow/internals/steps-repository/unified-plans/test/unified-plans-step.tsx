/** @jest-environment jsdom */
// @ts-nocheck - TODO: Fix TypeScript issues
jest.mock( 'calypso/signup/step-wrapper', () => () => <div data-testid="start-step-wrapper" /> );
jest.mock( '@automattic/onboarding/src/step-container', () => () => (
	<div data-testid="stepper-step-wrapper" />
) );
jest.mock( 'calypso/components/marketing-message', () => 'marketing-message' );
jest.mock( 'calypso/lib/wp', () => ( { req: { post: () => {} } } ) );

import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { renderStep } from '../../test/helpers';
import UnifiedPlansStep, { type UnifiedPlansStepProps } from '../unified-plans-step';

const noop = () => {};

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
} );
