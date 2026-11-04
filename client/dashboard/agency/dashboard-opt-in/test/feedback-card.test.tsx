/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';
import DashboardFeedbackCard from '../feedback-card';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function captureSurvey( { success = true }: { success?: boolean } = {} ) {
	const body: { value?: unknown } = {};
	nock( API )
		.post( '/wpcom/v2/marketing/survey', ( posted ) => {
			body.value = posted;
			return true;
		} )
		.reply( success ? 200 : 500, { success } );
	return body;
}

function renderCard() {
	// SnackbarList reaches for window.scrollTo, which jsdom does not implement.
	window.scrollTo = jest.fn();
	return render(
		<>
			<DashboardFeedbackCard agencyId={ AGENCY_ID } />
			<Snackbars />
		</>
	);
}

describe( '<DashboardFeedbackCard>', () => {
	test( 'sends only once something has been written', async () => {
		const user = userEvent.setup();
		renderCard();

		const button = screen.getByRole( 'button', { name: 'Send feedback' } );
		expect( button ).toBeDisabled();

		await user.type( screen.getByRole( 'textbox', { name: 'Your feedback' } ), '   ' );
		expect( button ).toBeDisabled();

		await user.type( screen.getByRole( 'textbox', { name: 'Your feedback' } ), 'Love it' );
		expect( button ).toBeEnabled();
	} );

	test( 'files the feedback against the agency and clears the field', async () => {
		const user = userEvent.setup();
		const survey = captureSurvey();
		const { recordTracksEvent } = renderCard();

		const textbox = screen.getByRole( 'textbox', { name: 'Your feedback' } );
		await user.type( textbox, 'The sites list is much faster.' );
		await user.click( screen.getByRole( 'button', { name: 'Send feedback' } ) );

		await waitFor( () => expect( textbox ).toHaveValue( '' ) );
		expect( survey.value ).toEqual( {
			site_id: AGENCY_ID,
			survey_id: 'a4a-feedback-dashboard-feedback',
			survey_responses: {
				comment: { text: 'The sites list is much faster.' },
				suggestions: { text: '' },
			},
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_dashboard_feedback_submit' );
		// The notice text also lands in the a11y live region, so this matches twice.
		const [ notice ] = await screen.findAllByText(
			'Thanks! Your feedback is on its way to our team.'
		);
		expect( notice ).toBeVisible();
	} );

	test( 'keeps the feedback on screen when sending fails', async () => {
		const user = userEvent.setup();
		captureSurvey( { success: false } );
		renderCard();

		const textbox = screen.getByRole( 'textbox', { name: 'Your feedback' } );
		await user.type( textbox, 'The sites list is much faster.' );
		await user.click( screen.getByRole( 'button', { name: 'Send feedback' } ) );

		const [ notice ] = await screen.findAllByText(
			'Failed to send your feedback. Please try again.'
		);
		expect( notice ).toBeVisible();
		expect( textbox ).toHaveValue( 'The sites list is much faster.' );
	} );
} );
