/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitStepButton } from '..';

describe( 'SubmitStepButton', () => {
	test( 'should render buttonText prop within a child button', () => {
		render( <SubmitStepButton buttonText="SubmitStepButton: buttonText" /> );
		const button = screen.getByRole( 'button' );
		expect( button ).toBeVisible();
		expect( button ).toHaveTextContent( 'SubmitStepButton: buttonText' );
	} );

	test( 'should trigger both submitSignupStep action and goToNextStep prop when clicked.', async () => {
		const submitSignupStep = jest.fn();
		const goToNextStep = jest.fn();

		render(
			<SubmitStepButton
				buttonText="buttonText"
				stepName="test:step:1"
				submitSignupStep={ submitSignupStep }
				goToNextStep={ goToNextStep }
			/>
		);

		expect( submitSignupStep ).not.toHaveBeenCalled();
		expect( goToNextStep ).not.toHaveBeenCalled();

		// after simulate click event
		const button = screen.getByRole( 'button' );
		await userEvent.click( button );

		// the functions should be called
		expect( submitSignupStep ).toHaveBeenCalledWith( { stepName: 'test:step:1' } );
		expect( goToNextStep ).toHaveBeenCalled();
	} );
} );
