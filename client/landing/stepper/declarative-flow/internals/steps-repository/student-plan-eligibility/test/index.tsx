/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import StudentPlanEligibility from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StudentPlanEligibilityReason } from '../hooks/use-student-plan-eligibility';

// The real action sends the browser to the logout page.
jest.mock( 'calypso/state/current-user/actions', () => ( {
	redirectToLogout: jest.fn( () => ( { type: 'TEST_REDIRECT_TO_LOGOUT' } ) ),
} ) );

const ELIGIBILITY_PATH = '/wpcom/v2/me/student-plan-eligibility';

const mockEligibility = ( reason: StudentPlanEligibilityReason, emailDomain = 'mit.edu' ) =>
	nock( 'https://public-api.wordpress.com:443' )
		.get( ELIGIBILITY_PATH )
		.query( true )
		.reply( 200, { eligible: reason === 'eligible', reason, email_domain: emailDomain } );

const render = ( props?: Partial< StepProps >, email = 'student@mit.edu' ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

	return renderStep(
		<QueryClientProvider client={ queryClient }>
			<StudentPlanEligibility
				{ ...mockStepProps( {
					stepName: 'student-plan-eligibility',
					flow: 'student',
					...props,
				} ) }
			/>
		</QueryClientProvider>,
		{
			initialEntry: '/setup/student/student-plan-eligibility',
			initialState: { currentUser: { user: { email } } },
		}
	);
};

describe( 'StudentPlanEligibility', () => {
	beforeAll( () => nock.disableNetConnect() );

	afterEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'continues the flow when the account is eligible', async () => {
		const submit = jest.fn();
		mockEligibility( 'eligible' );

		render( { navigation: { submit } } );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { eligible: true } ) );
	} );

	/**
	 * A supported but unconfirmed email must never reach the not-supported screen.
	 */
	it( 'asks an unverified academic account to confirm its email', async () => {
		const submit = jest.fn();
		mockEligibility( 'unverified' );

		render( { navigation: { submit } } );

		expect(
			await screen.findByRole( 'heading', { name: 'Confirm your email to get the Student plan' } )
		).toBeVisible();
		expect(
			screen.getByText(
				'Open the confirmation link we sent to student@mit.edu, then come back to this page.'
			)
		).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'explains the options to an account without a school email', async () => {
		const submit = jest.fn();
		mockEligibility( 'not_academic', 'gmail.com' );

		render( { navigation: { submit } }, 'student@gmail.com' );

		expect(
			await screen.findByRole( 'heading', { name: 'The Student plan needs a school email' } )
		).toBeVisible();
		expect(
			screen.getByText(
				'Your account uses student@gmail.com. To get the Student plan on your own, sign up with a school email ending in .edu, .ac.uk or .ac.jp.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Share with your teacher' } ) ).toHaveAttribute(
			'href',
			'https://wp.com/education'
		);
		expect( screen.getByRole( 'link', { name: 'Have an invitation code?' } ) ).toHaveAttribute(
			'href',
			'/setup/education'
		);
		expect(
			screen.getByRole( 'link', { name: 'Continue with other WordPress.com plans' } )
		).toHaveAttribute( 'href', '/setup/onboarding' );
		expect( submit ).not.toHaveBeenCalled();

		await userEvent.click( screen.getByRole( 'button', { name: 'Sign up with my school email' } ) );

		expect( redirectToLogout ).toHaveBeenCalledWith( `${ window.location.origin }/setup/student` );
	} );

	it( 'tells an account that already has the plan where to find it', async () => {
		mockEligibility( 'already_owned' );

		render();

		expect(
			await screen.findByRole( 'heading', { name: 'You already have the Student plan' } )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Go to my sites' } ) ).toHaveAttribute(
			'href',
			'/sites'
		);
		expect( screen.getByRole( 'link', { name: 'View purchases' } ) ).toHaveAttribute(
			'href',
			'/me/purchases'
		);
	} );

	it( 'offers a retry when the check fails', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( ELIGIBILITY_PATH )
			.query( true )
			.reply( 500, { code: 'internal_server_error' } );
		mockEligibility( 'eligible' );
		const submit = jest.fn();

		render( { navigation: { submit } } );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Try again' } ) );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { eligible: true } ) );
	} );
} );
