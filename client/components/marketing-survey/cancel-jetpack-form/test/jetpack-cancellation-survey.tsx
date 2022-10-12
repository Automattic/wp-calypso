/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import JetpackCancellationSurvey from '../jetpack-cancellation-survey';

const customAnswerText = {
	other: 'Share your experience (required)',
	rest: 'Are there any details you would like to share?',
};

describe( 'JetpackCancellationSurvey', () => {
	test( 'should hide text field if no answer is selected', () => {
		render( <JetpackCancellationSurvey onAnswerChange={ () => null } selectedAnswerId={ '' } /> );

		expect( screen.queryByLabelText( customAnswerText.other ) ).not.toBeInTheDocument();
		expect( screen.queryByLabelText( customAnswerText.rest ) ).not.toBeInTheDocument();
	} );

	test( 'should show text field if answer is selected', () => {
		render(
			<JetpackCancellationSurvey
				onAnswerChange={ () => null }
				selectedAnswerId={ 'want-to-downgrade' }
			/>
		);

		expect( screen.queryByLabelText( customAnswerText.other ) ).not.toBeInTheDocument();
		expect( screen.getByLabelText( customAnswerText.rest ) ).toBeInTheDocument();
	} );

	test( 'should show "Other" text field if "Other" is selected', () => {
		render(
			<JetpackCancellationSurvey
				onAnswerChange={ () => null }
				selectedAnswerId={ 'another-reason' }
			/>
		);

		expect( screen.getByLabelText( customAnswerText.other ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( customAnswerText.rest ) ).not.toBeInTheDocument();
	} );
} );
