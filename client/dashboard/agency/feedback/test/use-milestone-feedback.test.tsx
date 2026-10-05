/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { useMilestoneFeedback } from '../use-milestone-feedback';
import type { A4AFeedbackEntry } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID } ] )
		.persist();
}

function mockPreferences( feedback?: Record< string, A4AFeedbackEntry > ) {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: feedback ? { 'a4a-feedback': feedback } : {},
		} )
		.persist();
}

function Probe() {
	const { shouldAsk } = useMilestoneFeedback( 'team-member-invite-sent' );
	return <div>{ shouldAsk ? 'ask' : 'quiet' }</div>;
}

describe( 'useMilestoneFeedback', () => {
	beforeEach( () => nock.cleanAll() );

	test( 'asks when the partner has never answered this milestone', async () => {
		mockAgency();
		mockPreferences();

		render( <Probe /> );

		// Quiet until the preference has actually been read: asking before it
		// resolves would re-ask someone who already answered in classic.
		expect( screen.getByText( 'quiet' ) ).toBeVisible();
		expect( await screen.findByText( 'ask' ) ).toBeVisible();
	} );

	test( 'stays quiet once the milestone was answered', async () => {
		mockAgency();
		mockPreferences( { 'team-member-invite-sent': { lastSubmittedAt: 1757000000000 } } );

		render( <Probe /> );

		await waitFor( () => expect( screen.getByText( 'quiet' ) ).toBeVisible() );
	} );

	test( 'stays quiet once the milestone was skipped', async () => {
		mockAgency();
		mockPreferences( { 'team-member-invite-sent': { lastSkippedAt: 1757000000000 } } );

		render( <Probe /> );

		await waitFor( () => expect( screen.getByText( 'quiet' ) ).toBeVisible() );
	} );

	test( 'asks even when another milestone was answered', async () => {
		mockAgency();
		mockPreferences( { 'referral-completed': { lastSubmittedAt: 1757000000000 } } );

		render( <Probe /> );

		expect( await screen.findByText( 'ask' ) ).toBeVisible();
	} );

	test( 'does not ask before the agency is known', async () => {
		mockPreferences();
		nock( API ).get( '/wpcom/v2/agency' ).query( true ).reply( 200, [] ).persist();

		render( <Probe /> );

		await waitFor( () => expect( screen.getByText( 'quiet' ) ).toBeVisible() );
	} );
} );
