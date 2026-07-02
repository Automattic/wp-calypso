/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { verifyEmail } from 'calypso/state/current-user/email-verification/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LaunchSiteComponent from '../';

jest.mock( 'calypso/signup/step-wrapper', () => ( props ) => props.stepContent );

jest.mock( 'calypso/state/signup/progress/selectors', () => ( {
	getSignupProgress: jest.fn(),
} ) );

jest.mock( 'calypso/state/signup/progress/actions', () => ( {
	submitSignupStep: jest.fn( () => ( { type: 'TEST_SUBMIT' } ) ),
} ) );

jest.mock( 'calypso/state/current-user/email-verification/actions', () => ( {
	verifyEmail: jest.fn( () => ( { type: 'TEST_VERIFY' } ) ),
} ) );

const STEP_NAME = 'launch';
const FLOW_NAME = 'launch-site';

function setProgress( step ) {
	getSignupProgress.mockReturnValue( step ? { [ STEP_NAME ]: step } : {} );
}

function renderStep() {
	return renderWithProvider(
		<LaunchSiteComponent flowName={ FLOW_NAME } stepName={ STEP_NAME } positionInFlow={ 2 } />
	);
}

describe( 'LaunchSiteComponent', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'submits the step on mount to kick off the launch', () => {
		setProgress( undefined );
		renderStep();
		expect( submitSignupStep ).toHaveBeenCalledWith( { stepName: STEP_NAME } );
	} );

	it( 'does not resubmit when the step is already in progress (avoids the remount loop)', () => {
		setProgress( { stepName: STEP_NAME, status: 'pending' } );
		renderStep();
		expect( submitSignupStep ).not.toHaveBeenCalled();
	} );

	it( 'renders nothing while the launch is pending', () => {
		setProgress( { stepName: STEP_NAME, status: 'pending' } );
		const { container } = renderStep();
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing on success (the flow controller handles navigation)', () => {
		setProgress( { stepName: STEP_NAME, status: 'completed' } );
		const { container } = renderStep();
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing on a non-email launch failure', () => {
		setProgress( { stepName: STEP_NAME, status: 'invalid', errors: { error: 'internal_error' } } );
		const { container } = renderStep();
		expect( container ).toBeEmptyDOMElement();
	} );

	describe( 'when the launch is blocked by an unverified email', () => {
		beforeEach( () => {
			setProgress( {
				stepName: STEP_NAME,
				status: 'invalid',
				errors: { error: 'email_unverified' },
			} );
		} );

		it( 'shows the verify-email panel', () => {
			renderStep();
			expect(
				screen.getByRole( 'heading', { name: 'Verify your email to launch' } )
			).toBeVisible();
		} );

		it( 'does not resubmit the step (the launch already resolved as invalid)', () => {
			renderStep();
			expect( submitSignupStep ).not.toHaveBeenCalled();
		} );

		it( 'resends the verification email when the user clicks Resend', async () => {
			renderStep();
			await userEvent.click( screen.getByRole( 'button', { name: 'Resend verification email' } ) );
			expect( verifyEmail ).toHaveBeenCalledWith( { showGlobalNotices: true } );
		} );

		it( 'retries the launch when the user clicks Try again', async () => {
			renderStep();
			await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
			expect( submitSignupStep ).toHaveBeenCalledWith( { stepName: STEP_NAME } );
		} );
	} );
} );
