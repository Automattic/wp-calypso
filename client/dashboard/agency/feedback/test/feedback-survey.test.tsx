/**
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://my.localhost/" }
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import FeedbackSurvey from '../feedback-survey';
import type { FeedbackConfig } from '../types';

const config: FeedbackConfig = {
	title: 'Invite emailed!',
	getDescription: () => 'desc',
	defaultReturnTo: '/team',
	suggestion: {
		label: 'What could have been better?',
		options: [ { label: 'Finding it', value: 'finding' } ],
	},
};

it( 'submits the assembled responses', async () => {
	const onSubmit = jest.fn();
	render(
		<FeedbackSurvey
			config={ config }
			description="desc"
			isSubmitting={ false }
			onSubmit={ onSubmit }
			onSkip={ jest.fn() }
		/>
	);

	await userEvent.click( screen.getByRole( 'checkbox', { name: 'Finding it' } ) );
	await userEvent.type( screen.getByRole( 'textbox' ), 'great' );
	await userEvent.click( screen.getByRole( 'button', { name: 'Send your feedback' } ) );

	expect( onSubmit ).toHaveBeenCalledWith( {
		experience: 'good',
		comment: 'great',
		suggestions: [ 'finding' ],
	} );
} );

it( 'skips', async () => {
	const onSkip = jest.fn();
	render(
		<FeedbackSurvey
			config={ config }
			description="desc"
			isSubmitting={ false }
			onSubmit={ jest.fn() }
			onSkip={ onSkip }
		/>
	);
	await userEvent.click( screen.getByRole( 'button', { name: 'Skip' } ) );
	expect( onSkip ).toHaveBeenCalled();
} );
