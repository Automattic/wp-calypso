/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LaunchSiteComponent from '../index';

jest.mock( 'calypso/state/signup/progress/actions', () => ( {
	submitSignupStep: jest.fn( () => ( { type: 'TEST_SUBMIT_SIGNUP_STEP' } ) ),
} ) );

const defaultProps = {
	flowName: 'launch-site',
	stepName: 'launch',
	positionInFlow: 2,
	signupDependencies: { siteSlug: 'example.wordpress.com' },
};

function renderStep( props = {} ) {
	return renderWithProvider(
		<LaunchSiteComponent { ...defaultProps } goToNextStep={ jest.fn() } { ...props } />
	);
}

describe( 'LaunchSiteComponent', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'launches the site once and renders nothing when the step has not run yet', () => {
		const goToNextStep = jest.fn();
		const { container } = renderStep( { goToNextStep } );

		expect( submitSignupStep ).toHaveBeenCalledTimes( 1 );
		expect( submitSignupStep ).toHaveBeenCalledWith( { stepName: 'launch' } );
		expect( goToNextStep ).toHaveBeenCalledTimes( 1 );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'does not launch again when the step already failed, and shows the error', () => {
		const goToNextStep = jest.fn();
		renderStep( {
			goToNextStep,
			step: {
				stepName: 'launch',
				status: 'invalid',
				errors: { message: 'You can not launch your site without a paid eCommerce plan.' },
			},
		} );

		expect( submitSignupStep ).not.toHaveBeenCalled();
		expect( goToNextStep ).not.toHaveBeenCalled();
		expect(
			screen.getByText( 'You can not launch your site without a paid eCommerce plan.' )
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Try again' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Go back' } ) ).toHaveAttribute(
			'href',
			'/home/example.wordpress.com'
		);
	} );

	it( 'sends the user back to where the launch flow was started from', () => {
		renderStep( {
			signupDependencies: {
				siteSlug: 'example.wordpress.com',
				back_to: '/sites/example.wordpress.com/settings',
			},
			step: { stepName: 'launch', status: 'invalid', errors: { message: 'Nope.' } },
		} );

		expect( screen.getByRole( 'link', { name: 'Go back' } ) ).toHaveAttribute(
			'href',
			'/sites/example.wordpress.com/settings'
		);
	} );

	it( 'sends the user back to wp-admin when the flow was started from there', () => {
		renderStep( {
			signupDependencies: { siteSlug: 'example.wordpress.com', refParameter: 'wp-admin' },
			step: { stepName: 'launch', status: 'invalid', errors: { message: 'Nope.' } },
		} );

		expect( screen.getByRole( 'link', { name: 'Go back' } ) ).toHaveAttribute(
			'href',
			'https://example.wordpress.com/wp-admin'
		);
	} );

	it( 'reads the error message from an array of errors', () => {
		renderStep( {
			step: {
				stepName: 'launch',
				status: 'invalid',
				errors: [ { message: 'This site is flagged as spam.' } ],
			},
		} );

		expect( screen.getByText( 'This site is flagged as spam.' ) ).toBeVisible();
	} );

	it( 'falls back to a generic message when the error has none', () => {
		renderStep( { step: { stepName: 'launch', status: 'invalid', errors: {} } } );

		expect(
			screen.getByText( 'Something went wrong and we couldn’t launch your site.' )
		).toBeVisible();
	} );

	it.each( [ 'pending', 'processing', 'completed' ] )(
		'does not resubmit when the step status is %s',
		( status ) => {
			const goToNextStep = jest.fn();
			const { container } = renderStep( {
				goToNextStep,
				step: { stepName: 'launch', status },
			} );

			expect( submitSignupStep ).not.toHaveBeenCalled();
			expect( goToNextStep ).not.toHaveBeenCalled();
			expect( container ).toBeEmptyDOMElement();
		}
	);
} );
