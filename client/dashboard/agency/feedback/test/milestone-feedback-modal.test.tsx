/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import MilestoneFeedbackModal from '../milestone-feedback-modal';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function mockAgency() {
	return nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID } ] )
		.persist();
}

function mockPreferences() {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: {
				'a4a-feedback': { 'referral-completed': { lastSubmittedAt: 1757000000000 } },
			},
		} )
		.persist();
}

function captureSurvey( status = 200 ) {
	const body: { value?: unknown } = {};
	nock( API )
		.post( '/wpcom/v2/marketing/survey', ( posted ) => {
			body.value = posted;
			return true;
		} )
		.reply( status, status === 200 ? {} : { message: 'nope' } );
	return body;
}

function capturePreference() {
	const body: { value?: unknown } = {};
	nock( API )
		.post( '/rest/v1.1/me/preferences', ( posted ) => {
			body.value = posted;
			return true;
		} )
		.reply( 200, { calypso_preferences: {} } );
	return body;
}

function renderModal( onClose = jest.fn() ) {
	const result = render(
		<MilestoneFeedbackModal
			type="team-member-invite-sent"
			args={ { email: 'nina@example.com' } }
			onClose={ onClose }
		/>
	);
	return { ...result, onClose };
}

describe( '<MilestoneFeedbackModal>', () => {
	beforeEach( () => nock.cleanAll() );

	test( 'files the answer against the agency and closes', async () => {
		mockAgency();
		mockPreferences();
		const survey = captureSurvey();
		capturePreference();
		const user = userEvent.setup();

		const { onClose, recordTracksEvent } = renderModal();

		expect( await screen.findByText( /We sent nina@example.com an invite/ ) ).toBeVisible();
		await user.click( screen.getByRole( 'radio', { name: 'Bad' } ) );
		await user.click(
			screen.getByRole( 'checkbox', { name: 'Finding where to invite my team members' } )
		);
		await user.click( screen.getByRole( 'checkbox', { name: 'Other' } ) );
		await user.type( screen.getByRole( 'textbox' ), 'The invite email looked like spam.' );
		await user.click( screen.getByRole( 'button', { name: 'Send your feedback' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		expect( survey.value ).toEqual( {
			site_id: AGENCY_ID,
			survey_id: 'a4a-feedback-team-member-invite-sent',
			survey_responses: {
				rating: 'bad',
				comment: { text: 'The invite email looked like spam.' },
				suggestions: { text: 'finding-where-to-invite-my-team-members, other' },
			},
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_feedback_submit',
			expect.objectContaining( {
				agency_id: AGENCY_ID,
				survey_id: 'team-member-invite-sent',
				rating: 'bad',
			} )
		);
	} );

	test( 'remembers the answer without discarding the other milestones', async () => {
		const agency = mockAgency();
		mockPreferences();
		captureSurvey();
		const preference = capturePreference();
		const user = userEvent.setup();

		renderModal();

		// Wait for the agency to resolve: submitting before it does is a no-op
		// (see useMilestoneFeedback), and the button gives no visual cue either way.
		await waitFor( () => expect( agency.isDone() ).toBe( true ) );
		await user.click( screen.getByRole( 'button', { name: 'Send your feedback' } ) );

		await waitFor( () => expect( preference.value ).toBeDefined() );
		const written = (
			preference.value as {
				calypso_preferences: { 'a4a-feedback': Record< string, Record< string, number > > };
			}
		 ).calypso_preferences[ 'a4a-feedback' ];
		expect( written[ 'team-member-invite-sent' ].lastSubmittedAt ).toEqual( expect.any( Number ) );
		expect( written[ 'referral-completed' ].lastSubmittedAt ).toBe( 1757000000000 );
	} );

	test( 'treats skipping as answered without filing a survey', async () => {
		mockAgency();
		mockPreferences();
		const survey = captureSurvey();
		const preference = capturePreference();
		const user = userEvent.setup();

		const { onClose, recordTracksEvent } = renderModal();

		await user.click( await screen.findByRole( 'button', { name: 'Skip' } ) );

		expect( onClose ).toHaveBeenCalled();
		await waitFor( () => expect( preference.value ).toBeDefined() );
		const written = (
			preference.value as {
				calypso_preferences: { 'a4a-feedback': Record< string, Record< string, number > > };
			}
		 ).calypso_preferences[ 'a4a-feedback' ];
		expect( written[ 'team-member-invite-sent' ].lastSkippedAt ).toEqual( expect.any( Number ) );
		expect( survey.value ).toBeUndefined();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_feedback_skip', {
			type: 'team-member-invite-sent',
		} );
	} );

	test( 'treats dismissing as skipping, so the prompt does not come back', async () => {
		mockAgency();
		mockPreferences();
		captureSurvey();
		const preference = capturePreference();
		const user = userEvent.setup();

		const { onClose } = renderModal();

		await user.click( await screen.findByRole( 'button', { name: 'Close' } ) );

		// Modal's own close button runs an exit animation before calling
		// onRequestClose, so the callback lands a tick after the click.
		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		await waitFor( () => expect( preference.value ).toBeDefined() );
	} );

	test( 'keeps the answer on screen when filing it fails', async () => {
		mockAgency();
		mockPreferences();
		captureSurvey( 500 );
		const preference = capturePreference();
		const user = userEvent.setup();

		const { onClose } = renderModal();

		await user.type( await screen.findByRole( 'textbox' ), 'The invite email looked like spam.' );
		await user.click( screen.getByRole( 'button', { name: 'Send your feedback' } ) );

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Send your feedback' } ) ).toBeEnabled()
		);
		expect( onClose ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'The invite email looked like spam.' );
		expect( preference.value ).toBeUndefined();
	} );
} );
