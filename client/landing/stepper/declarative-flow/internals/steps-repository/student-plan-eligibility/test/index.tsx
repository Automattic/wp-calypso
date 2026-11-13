/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { fetchCurrentUser, redirectToLogout } from 'calypso/state/current-user/actions';
import StudentPlanEligibility from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StudentPlanEligibilityReason } from '../hooks/use-student-plan-eligibility';

// The real actions send the browser to the logout page and fetch `/me`.
jest.mock( 'calypso/state/current-user/actions', () => ( {
	...jest.requireActual( 'calypso/state/current-user/actions' ),
	redirectToLogout: jest.fn( () => ( { type: 'TEST_REDIRECT_TO_LOGOUT' } ) ),
	fetchCurrentUser: jest.fn( () => ( { type: 'TEST_FETCH_CURRENT_USER' } ) ),
} ) );

// Short waits between the checks after a confirmation, so the tests don't sit through seconds.
jest.mock( '../constants', () => ( { CONFIRMED_RECHECK_DELAYS_MS: [ 0, 10, 20, 30 ] } ) );

const ELIGIBILITY_PATH = '/wpcom/v2/me/student-plan-eligibility';
const SEND_VERIFICATION_EMAIL_PATH = '/rest/v1.1/me/send-verification-email';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const mockEligibility = ( reason: StudentPlanEligibilityReason, emailDomain = 'mit.edu' ) =>
	mockApi()
		.get( ELIGIBILITY_PATH )
		.query( true )
		.reply( 200, { eligible: reason === 'eligible', reason, email_domain: emailDomain } );

type RenderOptions = {
	props?: Partial< StepProps >;
	email?: string;
	emailVerified?: boolean;
};

const render = ( {
	props,
	email = 'student@mit.edu',
	emailVerified = false,
}: RenderOptions = {} ) => {
	// No test defaults: the hook's own options (no retries included) are under test.
	const queryClient = new QueryClient();

	renderStep(
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
			initialState: { currentUser: { user: { email, email_verified: emailVerified } } },
		}
	);

	return queryClient;
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

		render( { props: { navigation: { submit } } } );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { eligible: true } ) );
		expect( submit ).toHaveBeenCalledTimes( 1 );
	} );

	/**
	 * Calypso restores persisted queries on page load, so a stale "eligible" from an earlier
	 * visit would skip the check for an account that has since bought the plan.
	 */
	it( 'keeps the eligibility answer out of the persisted query cache', async () => {
		mockEligibility( 'not_academic' );

		const queryClient = render();

		await screen.findByRole( 'heading', { name: 'The Student plan needs a school email' } );
		expect(
			queryClient.getQueryCache().find( { queryKey: [ 'student-plan-eligibility' ] } )?.meta
		).toEqual( { persist: false } );
	} );

	describe( 'unverified email', () => {
		/**
		 * A supported but unconfirmed email must never reach the not-supported screen.
		 */
		it( 'asks an unverified academic account to confirm its email', async () => {
			const submit = jest.fn();
			mockEligibility( 'unverified' );

			render( { props: { navigation: { submit } } } );

			expect(
				await screen.findByRole( 'heading', {
					name: 'Confirm your email to get the Student plan',
				} )
			).toBeVisible();
			expect(
				screen.getByText(
					'Open the confirmation link we sent to student@mit.edu. This page continues on its own once your email is confirmed.'
				)
			).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeEnabled();
			expect( submit ).not.toHaveBeenCalled();
		} );

		/**
		 * The source decides where the link in the email goes: wpcom sends it back to the flow.
		 */
		it( 'resends the email with a link back to the Student flow', async () => {
			mockEligibility( 'unverified' );
			const sent: { from?: string }[] = [];
			mockApi()
				.post( SEND_VERIFICATION_EMAIL_PATH, ( body ) => {
					sent.push( body );
					return true;
				} )
				.reply( 200, { success: true, retry_after: 300 } );

			render();

			await userEvent.click( await screen.findByRole( 'button', { name: 'Resend email' } ) );

			expect( await screen.findByRole( 'status' ) ).toHaveTextContent(
				'We sent the email again. Check your inbox and spam folder.'
			);
			expect( sent ).toEqual( [
				expect.objectContaining( { from: 'student-with-email-verification' } ),
			] );
			expect( screen.getByRole( 'button', { name: /^Resend email \(\d:\d\d\)$/ } ) ).toBeDisabled();
		} );

		it( 'says so when the server refuses another email for now', async () => {
			mockEligibility( 'unverified' );
			mockApi()
				.post( SEND_VERIFICATION_EMAIL_PATH )
				.reply( 429, { error: 'throttled', message: 'Too many', data: { retry_after: 120 } } );

			render();

			await userEvent.click( await screen.findByRole( 'button', { name: 'Resend email' } ) );

			expect( await screen.findByRole( 'status' ) ).toHaveTextContent(
				'Too many attempts. Please wait before trying again.'
			);
			expect( screen.getByRole( 'button', { name: /^Resend email \(\d:\d\d\)$/ } ) ).toBeDisabled();
		} );

		it( 'says so when the email could not be sent', async () => {
			mockEligibility( 'unverified' );
			mockApi().post( SEND_VERIFICATION_EMAIL_PATH ).reply( 500, { error: 'unknown' } );

			render();

			await userEvent.click( await screen.findByRole( 'button', { name: 'Resend email' } ) );

			expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
				'We couldn’t send the email. Please try again in a moment.'
			);
			expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeEnabled();
		} );

		/**
		 * The eligibility endpoint is rate limited, so the screen watches `/me` instead.
		 */
		it( 'checks the account again when the person comes back to the tab', async () => {
			mockEligibility( 'unverified' );

			render();

			await screen.findByRole( 'heading', { name: 'Confirm your email to get the Student plan' } );
			jest.mocked( fetchCurrentUser ).mockClear();

			act( () => {
				window.dispatchEvent( new Event( 'focus' ) );
			} );

			expect( fetchCurrentUser ).toHaveBeenCalled();
		} );

		/**
		 * The confirmation arrives while the screen is up: `/me` turns verified, and the polling stops.
		 */
		it( 'continues once `/me` reports the email as confirmed', async () => {
			const submit = jest.fn();
			mockEligibility( 'unverified' );
			mockEligibility( 'eligible' );

			render( { props: { navigation: { submit } } } );

			await screen.findByRole( 'heading', { name: 'Confirm your email to get the Student plan' } );
			jest.mocked( fetchCurrentUser ).mockReturnValueOnce( {
				type: 'CURRENT_USER_SET_EMAIL_VERIFIED',
				verified: true,
			} as never );

			act( () => {
				window.dispatchEvent( new Event( 'focus' ) );
			} );

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( { eligible: true } ) );
			expect( submit ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'checks eligibility on arrival when `/me` already reports the email as confirmed', async () => {
			const submit = jest.fn();
			mockEligibility( 'unverified' );
			mockEligibility( 'eligible' );

			render( { props: { navigation: { submit } }, emailVerified: true } );

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( { eligible: true } ) );
			expect( submit ).toHaveBeenCalledTimes( 1 );
		} );

		/**
		 * The endpoint can lag behind `/me` for a moment after the confirmation.
		 */
		it( 'checks again while a confirmed email still reads as unverified', async () => {
			const submit = jest.fn();
			mockEligibility( 'unverified' );
			mockEligibility( 'unverified' );
			mockEligibility( 'unverified' );
			mockEligibility( 'eligible' );

			render( { props: { navigation: { submit } }, emailVerified: true } );

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( { eligible: true } ) );
			expect( submit ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'offers a retry, and stops polling, when a confirmed email keeps reading as unverified', async () => {
			const submit = jest.fn();
			// The first answer, then one for each of the four checks after the confirmation.
			for ( let i = 0; i < 5; i++ ) {
				mockEligibility( 'unverified' );
			}
			mockEligibility( 'eligible' );

			render( { props: { navigation: { submit } }, emailVerified: true } );

			expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
				'Your email is confirmed, but we couldn’t continue. Please try again.'
			);
			jest.mocked( fetchCurrentUser ).mockClear();
			act( () => {
				window.dispatchEvent( new Event( 'focus' ) );
			} );
			expect( fetchCurrentUser ).not.toHaveBeenCalled();

			await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( { eligible: true } ) );
		} );

		it( 'offers a retry when the check after the confirmation fails', async () => {
			const submit = jest.fn();
			mockEligibility( 'unverified' );
			mockApi().get( ELIGIBILITY_PATH ).query( true ).reply( 429, { code: 'rate_limit_exceeded' } );
			mockEligibility( 'eligible' );

			render( { props: { navigation: { submit } }, emailVerified: true } );

			expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
				'Your email is confirmed, but we couldn’t continue. Please try again.'
			);

			await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( { eligible: true } ) );
		} );
	} );

	it( 'explains the options to an account without a school email', async () => {
		const submit = jest.fn();
		mockEligibility( 'not_academic', 'gmail.com' );

		render( { props: { navigation: { submit } }, email: 'student@gmail.com' } );

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
		mockApi().get( ELIGIBILITY_PATH ).query( true ).reply( 500, { code: 'internal_server_error' } );
		mockEligibility( 'eligible' );
		const submit = jest.fn();

		render( { props: { navigation: { submit } } } );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Try again' } ) );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { eligible: true } ) );
	} );
} );
