/**
 * @jest-environment jsdom
 */

jest.mock( '../use-mobile-layout-experiment', () => jest.fn() );

import { screen } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UserStep from '..';
import useMobileLayoutExperiment from '../use-mobile-layout-experiment';

const mockUseMobileLayoutExperiment = useMobileLayoutExperiment as unknown as jest.Mock;

const defaultExperimentResult = {
	isLoading: false,
	isEligible: false,
	variationName: 'control' as const,
	isMobileTreatment: false,
	isMobileTreatmentTosTop: false,
};

describe( 'User email signup step', () => {
	beforeEach( () => {
		mockUseMobileLayoutExperiment.mockReturnValue( defaultExperimentResult );
	} );

	const renderUserStep = ( url = '/onboarding/user?user_email=test@example.com' ) => {
		return renderWithProvider(
			<MemoryRouter initialEntries={ [ url ] }>
				<UserStep flow="onboarding" stepName="user" navigation={ { submit: jest.fn() } } />
			</MemoryRouter>,
			{ reducers: { login: loginReducer, route: routeReducer } }
		);
	};

	it( 'passes userEmail from user_email query param to SignupFormSocialFirst', () => {
		renderUserStep( '/onboarding/user?user_email=hello@wp.com' );
		expect( screen.getByLabelText( 'Enter your email' ) ).toHaveValue( 'hello@wp.com' );
	} );

	it( 'defaults userEmail to empty string when user_email is missing', () => {
		renderUserStep( '/onboarding/user' );
		expect( screen.getByLabelText( 'Enter your email' ) ).toHaveValue( '' );
	} );

	describe( 'mobile-layout experiment', () => {
		it( 'renders the default heading on control', () => {
			renderUserStep();
			expect( screen.getByRole( 'heading', { name: 'Create your account' } ) ).toBeInTheDocument();
			expect(
				screen.queryByRole( 'heading', { name: 'Welcome to WordPress.com' } )
			).not.toBeInTheDocument();
		} );

		it( 'swaps the heading copy on the bottom-position treatment', () => {
			mockUseMobileLayoutExperiment.mockReturnValue( {
				...defaultExperimentResult,
				isEligible: true,
				variationName: 'treatment_tos_bottom',
				isMobileTreatment: true,
			} );

			renderUserStep();

			expect(
				screen.getByRole( 'heading', { name: 'Welcome to WordPress.com' } )
			).toBeInTheDocument();
			expect( screen.getByText( 'Sign up free to start creating your site.' ) ).toBeInTheDocument();
			// "Above" copy: ToS lives inside the form, rendered by SignupFormSocialFirst.
			expect(
				screen.getByText( /By continuing with any of the options above/i )
			).toBeInTheDocument();
			expect(
				screen.queryByText( /By continuing with any of the options below/i )
			).not.toBeInTheDocument();
		} );

		it( 'renders the heading-slot ToS on the top-position treatment', () => {
			mockUseMobileLayoutExperiment.mockReturnValue( {
				...defaultExperimentResult,
				isEligible: true,
				variationName: 'treatment_tos_top',
				isMobileTreatment: true,
				isMobileTreatmentTosTop: true,
			} );

			const { container } = renderUserStep();

			expect(
				screen.getByRole( 'heading', { name: 'Welcome to WordPress.com' } )
			).toBeInTheDocument();
			// "Below" copy is in the heading slot, not the form.
			expect(
				screen.getByText( /By continuing with any of the options below/i )
			).toBeInTheDocument();
			expect(
				screen.queryByText( /By continuing with any of the options above/i )
			).not.toBeInTheDocument();
			// The in-form ToS is suppressed by hideTosElement — exactly one tos-link
			// element is rendered (the one in the heading slot).
			expect( container.querySelectorAll( '.signup-form-social-first__tos-link' ) ).toHaveLength(
				1
			);
		} );

		it( 'defers rendering the heading and form while the assignment is loading', () => {
			mockUseMobileLayoutExperiment.mockReturnValue( {
				...defaultExperimentResult,
				isEligible: true,
				isLoading: true,
			} );

			renderUserStep();

			// Neither cohort sees the other variant's copy flash on cold visits.
			expect( screen.queryByRole( 'heading' ) ).not.toBeInTheDocument();
			expect( screen.queryByLabelText( 'Enter your email' ) ).not.toBeInTheDocument();
		} );
	} );
} );
