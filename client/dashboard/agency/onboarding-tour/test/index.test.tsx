/**
 * @jest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import AgencyOnboardingTour from '../';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';

const API = 'https://public-api.wordpress.com';
const PREFERENCE = 'a4a-dashboard-onboarding-tour-section';

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 1 } ] )
		.persist();
}

function mockSavedSection( section?: string, delay = 0 ) {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.delay( delay )
		.reply( 200, { calypso_preferences: section ? { [ PREFERENCE ]: section } : {} } );
}

// Resolves when the given section is saved on the server.
function expectSectionSaved( section: string ) {
	return new Promise< void >( ( resolve ) => {
		nock( API )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				if ( body.calypso_preferences?.[ PREFERENCE ] === section ) {
					resolve();
					return true;
				}
				return false;
			} )
			.query( true )
			.reply( 200, { calypso_preferences: { [ PREFERENCE ]: section } } );
	} );
}

// Resolves when the saved section is cleared on the server.
function expectSavedSectionCleared() {
	return new Promise< void >( ( resolve ) => {
		nock( API )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				if ( body.calypso_preferences?.[ PREFERENCE ] === null ) {
					resolve();
					return true;
				}
				return false;
			} )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );
	} );
}

function renderTour() {
	return render(
		<>
			<Snackbars />
			<AgencyOnboardingTour>
				<p>Agency page</p>
			</AgencyOnboardingTour>
		</>,
		{ queryClient }
	);
}

describe( '<AgencyOnboardingTour>', () => {
	beforeEach( () => {
		mockAgency();
	} );

	afterEach( () => {
		nock.cleanAll();
		queryClient.clear();
		act( () => {
			dispatch( noticesStore ).removeAllNotices( 'snackbar' );
		} );
		window.history.replaceState( null, '', '/' );
	} );

	test( 'saves the section and offers to pick the tour back up after an explore click', async () => {
		window.history.replaceState( null, '', '/overview#onboarding-tour-sites' );
		mockSavedSection();
		const saved = expectSectionSaved( 'sites' );
		renderTour();

		await userEvent.click( await screen.findByRole( 'link', { name: 'Connect your first site' } ) );

		await saved;
		await waitFor( () =>
			expect(
				screen.queryByRole( 'heading', {
					name: 'One dashboard. Every site. Seamless management.',
				} )
			).not.toBeInTheDocument()
		);
		expect( await screen.findByRole( 'button', { name: 'Continue tour' } ) ).toBeInTheDocument();
	} );

	test( 'offers to pick the tour back up at the saved section', async () => {
		mockSavedSection( 'sites' );
		const cleared = expectSavedSectionCleared();
		renderTour();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Continue tour' } ) );

		expect(
			await screen.findByRole( 'heading', {
				name: 'One dashboard. Every site. Seamless management.',
			} )
		).toBeVisible();
		await cleared;
	} );

	test( 'forgets the saved section when the snackbar is dismissed', async () => {
		mockSavedSection( 'sites' );
		const cleared = expectSavedSectionCleared();
		renderTour();

		await screen.findByRole( 'button', { name: 'Continue tour' } );
		await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss this notice' } ) );

		await cleared;
		await waitFor( () =>
			expect( screen.queryByRole( 'button', { name: 'Continue tour' } ) ).not.toBeInTheDocument()
		);
	} );

	test( 'does not offer to pick back up a tour opened by a link before preferences loaded', async () => {
		window.history.replaceState( null, '', '/overview#onboarding-tour-team' );
		mockSavedSection( 'sites', 200 );
		const cleared = expectSavedSectionCleared();
		renderTour();

		expect(
			await screen.findByRole( 'heading', { name: 'Invite your team. Reclaim your time.' } )
		).toBeVisible();
		await cleared;

		await userEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );
		await waitFor( () =>
			expect(
				screen.queryByRole( 'heading', { name: 'Invite your team. Reclaim your time.' } )
			).not.toBeInTheDocument()
		);
		expect( screen.queryByRole( 'button', { name: 'Continue tour' } ) ).not.toBeInTheDocument();
	} );
} );
