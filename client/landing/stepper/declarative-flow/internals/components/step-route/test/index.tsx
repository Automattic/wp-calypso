/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { waitFor } from '@testing-library/react';
import { addQueryArgs } from '@wordpress/url';
import React, { FC, Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import recordStepComplete from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-complete';
import recordStepStart from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-start';
import { useIntent } from 'calypso/landing/stepper/hooks/use-intent';
import { useSelectedDesign } from 'calypso/landing/stepper/hooks/use-selected-design';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import {
	getSignupCompleteFlowName,
	getSignupCompleteStepNameAndClear,
} from 'calypso/signup/storageUtils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StepRoute from '../';
import type {
	Flow,
	StepperStep,
	StepProps,
	NavigationControls,
} from 'calypso/landing/stepper/declarative-flow/internals/types';

jest.mock( 'calypso/signup/storageUtils' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-start' );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-complete' );
jest.mock( 'calypso/landing/stepper/hooks/use-intent' );
jest.mock( 'calypso/landing/stepper/hooks/use-selected-design' );
jest.mock( 'calypso/lib/analytics/page-view' );

const regularStep: StepperStep = {
	slug: 'some-step-slug',
	asyncComponent: jest.fn(), // For the purpose of this test, we don't need to render the using lazy strategy
};

const requiresLoginStep: StepperStep = {
	...regularStep,
	requiresLoggedInUser: true,
};

const FakeStep: FC< StepProps > = () => {
	return <div>Step Content</div>;
};

const fakeFlow: Flow = {
	name: 'some-flow',
	useSteps: () => [ regularStep ],
	useStepNavigation: () => ( {
		submit: () => {},
	} ),

	isSignupFlow: false,
};

const fakeRenderStep = ( step: StepperStep ) => {
	const StepComponent = FakeStep;
	const navigationControls = {} as NavigationControls;
	const stepData = {} as any;

	return (
		<StepComponent
			navigation={ navigationControls }
			flow={ fakeFlow.name }
			variantSlug={ fakeFlow.variantSlug }
			stepName={ step.slug }
			data={ stepData }
		/>
	);
};

interface RenderProps {
	step: StepperStep;
	renderStep?: ( step: StepperStep ) => JSX.Element | null;
}

const render = ( { step, renderStep = fakeRenderStep }: RenderProps ) => {
	return renderWithProvider(
		<MemoryRouter
			basename="/setup"
			initialEntries={ [ '/setup/some-flow/some-step-slug?param=example.com' ] }
		>
			<Suspense fallback={ null }>
				<StepRoute step={ step } flow={ fakeFlow } renderStep={ renderStep } />
			</Suspense>
		</MemoryRouter>
	);
};

describe( 'StepRoute', () => {
	// we need to save the original object for later to not affect tests from other files
	const originalLocation = window.location;

	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
		} );
		( useIntent as jest.Mock ).mockReturnValue( 'build' );
		( useSelectedDesign as jest.Mock ).mockReturnValue( { design_type: 'premium' } );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	it( 'renders the step content', async () => {
		const { getByText } = render( { step: regularStep } );

		expect( getByText( 'Step Content' ) ).toBeInTheDocument();
	} );

	it( 'does not render the step content when renderStep() returns null', async () => {
		const { queryByText } = render( { step: regularStep, renderStep: () => null } );

		expect( queryByText( 'Step Content' ) ).not.toBeInTheDocument();
	} );

	describe( 'requiresLoggedInUser', () => {
		it( 'redirects users to the login page if the step requires a logged in user', async () => {
			render( { step: requiresLoginStep } );

			await waitFor( () =>
				expect( window.location.assign ).toHaveBeenCalledWith(
					addQueryArgs( '/start/account/user-social', {
						variationName: 'some-flow',
						redirect_to: '/setup/some-flow/some-step-slug?param=example.com',
						toStepper: 'true',
					} )
				)
			);
		} );

		it( 'renders the step content if the user is logged in', async () => {
			( isUserLoggedIn as jest.Mock ).mockReturnValue( true );
			const { getByText } = render( { step: requiresLoginStep } );

			await waitFor( () => expect( getByText( 'Step Content' ) ).toBeInTheDocument() );
		} );
	} );

	describe( 'tracking', () => {
		it( 'records a page view', async () => {
			render( { step: regularStep } );

			expect( recordPageView ).toHaveBeenCalledWith( '/', 'Setup > some-flow > some-step-slug', {
				flow: 'some-flow',
				is_simplified_onboarding: false,
			} );
		} );

		it( 'records recordStepStart', async () => {
			render( { step: regularStep } );

			expect( recordStepStart ).toHaveBeenCalledWith( 'some-flow', 'some-step-slug', {
				intent: 'build',
				is_in_hosting_flow: false,
			} );
		} );

		it( 'records recordStepStart with additional props when the step is re-entered', () => {
			( getSignupCompleteFlowName as jest.Mock ).mockReturnValue( 'some-flow' );
			( getSignupCompleteStepNameAndClear as jest.Mock ).mockReturnValue( 'some-step-slug' );

			render( { step: regularStep } );

			expect( recordStepStart ).toHaveBeenCalledWith( 'some-flow', 'some-step-slug', {
				is_reentering_step_after_signup_complete: true,
				signup_complete_flow_name: 'some-flow',
				signup_complete_step_name: 'some-step-slug',
				intent: 'build',
				is_in_hosting_flow: false,
			} );
		} );

		it( 'records step-complete when the step is unmounted and step-start was previously recorded', () => {
			( getSignupCompleteFlowName as jest.Mock ).mockReturnValue( 'some-other-flow' );
			( getSignupCompleteStepNameAndClear as jest.Mock ).mockReturnValue( 'some-other-step-slug' );
			const { unmount } = render( { step: regularStep } );

			expect( recordStepComplete ).not.toHaveBeenCalled();
			unmount();
			expect( recordStepComplete ).toHaveBeenCalledWith( {
				step: 'some-step-slug',
				flow: 'some-flow',
				optionalProps: {
					intent: 'build',
					signup_complete_flow_name: 'some-other-flow',
					signup_complete_step_name: 'some-other-step-slug',
				},
			} );
		} );

		it( 'records skip_step_render on start, complete and page view when the login is required and the user is not logged in', async () => {
			( isUserLoggedIn as jest.Mock ).mockReturnValue( false );
			( getSignupCompleteFlowName as jest.Mock ).mockReturnValue( 'some-other-flow' );
			( getSignupCompleteStepNameAndClear as jest.Mock ).mockReturnValue( 'some-other-step-slug' );

			const { unmount } = render( { step: requiresLoginStep } );

			expect( recordStepStart ).toHaveBeenCalledWith( 'some-flow', 'some-step-slug', {
				intent: 'build',
				is_in_hosting_flow: false,
				skip_step_render: true,
				signup_complete_flow_name: 'some-other-flow',
				signup_complete_step_name: 'some-other-step-slug',
			} );
			expect( recordPageView ).toHaveBeenCalledWith( '/', 'Setup > some-flow > some-step-slug', {
				flow: 'some-flow',
				skip_step_render: true,
				is_simplified_onboarding: false,
				signup_complete_flow_name: 'some-other-flow',
				signup_complete_step_name: 'some-other-step-slug',
			} );

			unmount();

			expect( recordStepComplete ).toHaveBeenCalledWith( {
				step: 'some-step-slug',
				flow: 'some-flow',
				optionalProps: {
					intent: 'build',
					skip_step_render: true,
					signup_complete_flow_name: 'some-other-flow',
					signup_complete_step_name: 'some-other-step-slug',
				},
			} );
		} );

		it( 'records skip_step_render on start, complete and page view when renderStep returns null', async () => {
			( getSignupCompleteFlowName as jest.Mock ).mockReturnValue( 'some-other-flow' );
			( getSignupCompleteStepNameAndClear as jest.Mock ).mockReturnValue( 'some-other-step-slug' );
			const { unmount } = render( { step: regularStep, renderStep: () => null } );

			expect( recordStepStart ).toHaveBeenCalledWith( 'some-flow', 'some-step-slug', {
				intent: 'build',
				is_in_hosting_flow: false,
				skip_step_render: true,
				signup_complete_flow_name: 'some-other-flow',
				signup_complete_step_name: 'some-other-step-slug',
			} );
			expect( recordPageView ).toHaveBeenCalledWith( '/', 'Setup > some-flow > some-step-slug', {
				flow: 'some-flow',
				is_simplified_onboarding: false,
				skip_step_render: true,
				signup_complete_flow_name: 'some-other-flow',
				signup_complete_step_name: 'some-other-step-slug',
			} );

			unmount();

			expect( recordStepComplete ).toHaveBeenCalledWith( {
				step: 'some-step-slug',
				flow: 'some-flow',
				optionalProps: {
					intent: 'build',
					skip_step_render: true,
					signup_complete_flow_name: 'some-other-flow',
					signup_complete_step_name: 'some-other-step-slug',
				},
			} );
		} );
	} );
} );
