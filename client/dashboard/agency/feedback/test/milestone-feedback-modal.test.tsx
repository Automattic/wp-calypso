/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery, rawUserPreferencesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';
import MilestoneFeedbackModal from '../milestone-feedback-modal';
import type { Agency } from '@automattic/api-core';

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
		.reply( status, status === 200 ? { success: true, err: null } : { message: 'nope' } );
	return body;
}

function captureRejectedSurvey() {
	const body: { value?: unknown } = {};
	nock( API )
		.post( '/wpcom/v2/marketing/survey', ( posted ) => {
			body.value = posted;
			return true;
		} )
		.reply( 200, { success: false, err: 'nope' } );
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

function renderModal( { withSnackbars = false }: { withSnackbars?: boolean } = {} ) {
	const onClose = jest.fn();
	const result = render(
		<>
			<MilestoneFeedbackModal
				type="team-member-invite-sent"
				args={ { email: 'nina@example.com' } }
				onClose={ onClose }
			/>
			{ withSnackbars && <Snackbars /> }
		</>
	);
	return { ...result, onClose };
}

function writtenFeedback( value: unknown ) {
	return (
		value as {
			calypso_preferences: { 'a4a-feedback': Record< string, Record< string, number > > };
		}
	 ).calypso_preferences[ 'a4a-feedback' ];
}

describe( '<MilestoneFeedbackModal>', () => {
	beforeEach( () => nock.cleanAll() );

	test( 'files the answer against the agency and closes', async () => {
		// SnackbarList reaches for window.scrollTo, which jsdom does not implement.
		window.scrollTo = jest.fn();
		mockAgency();
		mockPreferences();
		const survey = captureSurvey();
		capturePreference();
		const user = userEvent.setup();

		const { onClose, recordTracksEvent } = renderModal( { withSnackbars: true } );

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

		// The notice text also lands in the a11y live region, so this matches twice.
		const [ notice ] = await screen.findAllByText(
			'Thanks! Our team will use your feedback to help prioritize improvements to Automattic for Agencies.'
		);
		expect( notice ).toBeVisible();
	} );

	test( 'remembers the answer without discarding the other milestones', async () => {
		mockAgency();
		mockPreferences();
		captureSurvey();
		const preference = capturePreference();
		const user = userEvent.setup();

		// Pre-seed both queries: the modal is only ever mounted once the caller's
		// `shouldAsk` is already true, which means this data, so there is nothing
		// to race against a click here.
		const queryClient = new QueryClient();
		queryClient.setQueryData( activeAgencyQuery().queryKey, { id: AGENCY_ID } as Agency );
		queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {
			'a4a-feedback': { 'referral-completed': { lastSubmittedAt: 1757000000000 } },
		} );

		const onClose = jest.fn();
		render(
			<MilestoneFeedbackModal
				type="team-member-invite-sent"
				args={ { email: 'nina@example.com' } }
				onClose={ onClose }
			/>,
			{ queryClient }
		);

		await user.click( screen.getByRole( 'button', { name: 'Send your feedback' } ) );

		await waitFor( () => expect( preference.value ).toBeDefined() );
		const written = writtenFeedback( preference.value );
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
		const written = writtenFeedback( preference.value );
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

		const { onClose, recordTracksEvent } = renderModal();

		await user.click( await screen.findByRole( 'button', { name: 'Close' } ) );

		// Modal's own close button runs an exit animation before calling
		// onRequestClose, so the callback lands a tick after the click.
		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		await waitFor( () => expect( preference.value ).toBeDefined() );
		const written = writtenFeedback( preference.value );
		expect( written[ 'team-member-invite-sent' ].lastSkippedAt ).toEqual( expect.any( Number ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_feedback_skip', {
			type: 'team-member-invite-sent',
		} );
	} );

	test( 'keeps the answer on screen when filing it fails', async () => {
		// SnackbarList reaches for window.scrollTo, which jsdom does not implement.
		window.scrollTo = jest.fn();
		mockAgency();
		mockPreferences();
		captureSurvey( 500 );
		const preference = capturePreference();
		const user = userEvent.setup();

		const { onClose } = renderModal( { withSnackbars: true } );

		await user.type( await screen.findByRole( 'textbox' ), 'The invite email looked like spam.' );
		await user.click( screen.getByRole( 'button', { name: 'Send your feedback' } ) );

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Send your feedback' } ) ).toBeEnabled()
		);
		expect( onClose ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'The invite email looked like spam.' );
		expect( preference.value ).toBeUndefined();

		const [ notice ] = await screen.findAllByText(
			'Failed to send your feedback. Please try again.'
		);
		expect( notice ).toBeVisible();
	} );

	test( 'keeps the answer on screen when the survey rejects the submission', async () => {
		mockAgency();
		mockPreferences();
		const survey = captureRejectedSurvey();
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
		expect( survey.value ).toBeDefined();
	} );
} );
