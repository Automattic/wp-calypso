/** @jest-environment jsdom */
// @ts-nocheck - TODO: Fix TypeScript issues
jest.mock( 'calypso/signup/step-wrapper', () => () => <div data-testid="start-step-wrapper" /> );
jest.mock( '@automattic/onboarding/src/step-container', () => () => (
	<div data-testid="stepper-step-wrapper" />
) );
jest.mock( 'calypso/components/marketing-message', () => 'marketing-message' );
jest.mock( 'calypso/lib/wp', () => ( { req: { post: () => {} } } ) );

import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import PlansStepAdaptor from '..';
import { renderStep } from '../../test/helpers';
import UnifiedPlansStep, { type UnifiedPlansStepProps } from '../unified-plans-step';
import * as unifiedPlansModule from '../unified-plans-step';

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

describe( 'Plans accepts-props', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders with copy overrides, hide toggles, interval, and tag overrides without blowing up', async () => {
		_render( {
			...props,
			useStepperWrapper: true,
			headerText: 'Custom plans header',
			subHeaderText: 'Custom plans subheader',
			hideFreePlan: true,
			hideEnterprisePlan: true,
			hidePersonalPlan: true,
			hidePremiumPlan: true,
			hideEcommercePlan: true,
			hidePlanTypeSelector: true,
			intervalType: '2yearly',
			highlightLabelOverrides: { [ PLAN_BUSINESS ]: 'Best for stores' },
			titleBadgeOverrides: { [ PLAN_BUSINESS ]: 'Team favorite' },
			taglineOverrides: { [ PLAN_BUSINESS ]: 'Best for scaling stores' },
		} );
		const stepWrapper = await waitFor( () => screen.getByTestId( 'stepper-step-wrapper' ) );
		expect( stepWrapper ).toBeVisible();
		expect( stepWrapper.parentNode ).toHaveClass( 'plans-step' );
	} );
} );

describe( 'Plans existing-site action', () => {
	afterEach( () => jest.restoreAllMocks() );

	it( 'submits the existing-site action without selecting a plan', async () => {
		jest
			.spyOn( unifiedPlansModule, 'default' )
			.mockImplementation( ( { subHeaderText } ) => <div>{ subHeaderText }</div> );
		const submit = jest.fn();
		renderStep(
			<PlansStepAdaptor
				flow="site-migration"
				navigation={ { submit } }
				showExistingSiteLink
				disablePlanSelection
				subHeaderText="Choose a plan for your new site."
			/>,
			{
				initialEntry:
					'/setup/site-migration/plans?from=https%3A%2F%2Fexample.com&platform=wordpress',
			}
		);
		const link = await screen.findByRole( 'button', {
			name: 'migrate to a site you already have',
		} );
		expect( link ).toBeVisible();
		await userEvent.click( link );
		expect( submit ).toHaveBeenCalledWith( {
			stepName: 'plans',
			cartItems: null,
			action: 'select-existing-site',
		} );
	} );

	it( 'does not offer the existing-site action in other flows by default', async () => {
		jest
			.spyOn( unifiedPlansModule, 'default' )
			.mockImplementation( ( { subHeaderText } ) => <div>{ subHeaderText }</div> );
		renderStep(
			<PlansStepAdaptor
				flow="onboarding"
				navigation={ { submit: jest.fn() } }
				subHeaderText="Choose a plan"
			/>,
			{ initialEntry: '/setup/onboarding/plans' }
		);
		expect( await screen.findByText( 'Choose a plan' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'migrate to a site you already have' } )
		).not.toBeInTheDocument();
	} );
} );
