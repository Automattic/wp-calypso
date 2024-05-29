/**
 * @jest-environment jsdom
 */

import { waitFor } from '@testing-library/react';
import React, { FC, Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import recordStepStart from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-start';
import {
	AsyncStepperStep,
	Flow,
	StepperStep,
	StepProps,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useIntent } from 'calypso/landing/stepper/hooks/use-intent';
import { useSelectedDesign } from 'calypso/landing/stepper/hooks/use-selected-design';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import {
	getSignupCompleteFlowNameAndClear,
	getSignupCompleteStepNameAndClear,
} from 'calypso/signup/storageUtils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StepRoute from '../';
import { NavigationControls } from '../../../types';

jest.mock( 'calypso/signup/storageUtils' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/analytics/record-step-start' );
jest.mock( 'calypso/landing/stepper/hooks/use-intent' );
jest.mock( 'calypso/landing/stepper/hooks/use-selected-design' );
jest.mock( 'calypso/lib/analytics/page-view' );

const RegularStep: StepperStep = {
	slug: 'some-step-slug',
	asyncComponent: jest.fn(), // For the purpose of this test, we don't need to render the using lazy strategy
};

const RequiresLoginStep: StepperStep = {
	...RegularStep,
	requiresLoggedInUser: true,
};

const FakeStep: FC< StepProps > = () => {
	return <div>Step Content</div>;
};

const FakeFlow: Flow = {
	name: 'some-flow',
	useSteps: () => [ RegularStep ],
	useStepNavigation: () => ( {
		submit: () => {},
	} ),

	isSignupFlow: false,
};

const fakeRenderStep = ( step: AsyncStepperStep ) => {
	const StepComponent = FakeStep;
	const navigationControls = {} as NavigationControls;
	const stepData = {} as any;

	return (
		<StepComponent
			navigation={ navigationControls }
			flow={ FakeFlow.name }
			variantSlug={ FakeFlow.variantSlug }
			stepName={ step.slug }
			data={ stepData }
		/>
	);
};
const render = ( { step, renderStep = fakeRenderStep } ) => {
	return renderWithProvider(
		<MemoryRouter>
			<Suspense fallback={ null }>
				<StepRoute
					step={ step }
					flow={ FakeFlow }
					showWooLogo={ false }
					renderStep={ renderStep }
				/>
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
		const { getByText } = render( { step: RegularStep } );

		await waitFor( () => expect( getByText( 'Step Content' ) ).toBeInTheDocument() );
	} );

	describe( 'requiresLoggedInUser', () => {
		it( 'redirects users to the login page if the step requires a logged in user', async () => {
			render( { step: RequiresLoginStep } );

			await waitFor( () =>
				expect( window.location.assign ).toHaveBeenCalledWith(
					'/start/account/user-social?variationName=some-flow&redirect_to=%2F&toStepper=true'
				)
			);
		} );

		it( 'renders the step content if the user is logged in', async () => {
			( isUserLoggedIn as jest.Mock ).mockReturnValue( true );
			const { getByText } = render( { step: RequiresLoginStep } );

			await waitFor( () => expect( getByText( 'Step Content' ) ).toBeInTheDocument() );
		} );
	} );

	describe( 'tracking', () => {
		it( 'records a page view when the step is rendered', async () => {
			render( { step: RegularStep } );

			expect( recordPageView ).toHaveBeenCalledWith( '/', 'Setup > some-flow > some-step-slug' );
		} );

		it( 'records recordStepStart when the step is rendered', async () => {
			render( { step: RegularStep } );

			expect( recordStepStart ).toHaveBeenCalledWith( 'some-flow', 'some-step-slug', {
				intent: 'build',
				assembler_source: 'premium',
				is_in_hosting_flow: false,
			} );
		} );

		it( 'does not record start and page view when the login is required and the user is not logged in', async () => {
			( isUserLoggedIn as jest.Mock ).mockReturnValue( false );
			render( { step: RequiresLoginStep } );

			expect( recordStepStart ).not.toHaveBeenCalled();
			expect( recordPageView ).not.toHaveBeenCalled();
		} );

		it( 'skips tracking when the step is re-entered', () => {
			( getSignupCompleteFlowNameAndClear as jest.Mock ).mockReturnValue( 'some-flow' );
			( getSignupCompleteStepNameAndClear as jest.Mock ).mockReturnValue( 'some-step-slug' );

			render( { step: RegularStep } );

			expect( recordStepStart ).not.toHaveBeenCalled();
		} );

		it( 'skips trackings when the renderStep returns null', () => {
			render( { step: RegularStep, renderStep: () => null } );

			expect( recordStepStart ).not.toHaveBeenCalled();
			expect( recordPageView ).not.toHaveBeenCalled();
		} );
	} );
} );
