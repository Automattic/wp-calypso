/**
 * @jest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { GuidedTourContextProvider, GuidedTourStep } from '../index';
import type { TourStep } from '../context';

const TOUR_ID = 'hosting-dashboard-tours-sites' as const;

// Let any re-triggered completion write fire. On the buggy code the write is
// re-armed on each failed attempt, so this real-time wait exposes the loop.
function settle() {
	return act( async () => {
		await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
	} );
}

function mockPreferencesRead() {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: {} } );
}

// The completion write always fails. Before the fix, the effect that fired it
// re-armed on the failed write and retried forever.
function mockFailingPreferencesWrite() {
	const counter = { count: 0 };
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.post( '/rest/v1.1/me/preferences' )
		.reply( () => {
			counter.count += 1;
			return [ 405, { error: 'not_allowed' } ];
		} );
	return counter;
}

// The completion write succeeds and persists the timestamp — the happy path.
function mockSucceedingPreferencesWrite() {
	const counter = { count: 0 };
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.post( '/rest/v1.1/me/preferences' )
		.reply( ( _uri, body ) => {
			counter.count += 1;
			return [
				200,
				{ calypso_preferences: ( body as { calypso_preferences: unknown } ).calypso_preferences },
			];
		} );
	return counter;
}

function renderTour( tours: TourStep[], { isSkippable }: { isSkippable?: boolean } = {} ) {
	// A real element so the step's anchor resolves synchronously (no selector poll).
	const target = document.createElement( 'div' );
	document.body.appendChild( target );

	// Use the shared query client so the mutation's `onSuccess` cache write and the
	// component's `useQuery` read are the same client, as in production.
	return render(
		<GuidedTourContextProvider tourId={ TOUR_ID } guidedTours={ tours } isSkippable={ isSkippable }>
			{ tours.map( ( tour ) => (
				<GuidedTourStep key={ tour.id } id={ tour.id } target={ target } inline />
			) ) }
		</GuidedTourContextProvider>,
		{ queryClient }
	);
}

describe( '<GuidedTourContextProvider>', () => {
	afterEach( () => {
		queryClient.clear();
		nock.cleanAll();
		document.body.innerHTML = '';
	} );

	test( 'completing a one-step tour writes once when the write succeeds', async () => {
		mockPreferencesRead();
		const write = mockSucceedingPreferencesWrite();

		const { recordTracksEvent } = renderTour( [
			{ id: 'step-1', title: 'Step 1', description: 'First' },
		] );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Got it' } ) );

		await waitFor( () => expect( write.count ).toBe( 1 ) );
		await settle();

		expect( write.count ).toBe( 1 );
		// The persisted timestamp completes the tour, so the step is gone.
		expect( screen.queryByRole( 'button', { name: 'Got it' } ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_end_tour', {
			tour_id: TOUR_ID,
			is_completed: true,
		} );
	} );

	test( 'completing a one-step tour writes exactly once when the write keeps failing', async () => {
		mockPreferencesRead();
		const write = mockFailingPreferencesWrite();

		const { recordTracksEvent } = renderTour( [
			{ id: 'step-1', title: 'Step 1', description: 'First' },
		] );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Got it' } ) );

		await waitFor( () => expect( write.count ).toBe( 1 ) );
		await settle();

		// Before the fix this climbed without bound as the effect re-fired.
		expect( write.count ).toBe( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_end_tour', {
			tour_id: TOUR_ID,
			is_completed: true,
		} );
	} );

	test( 'finishing a multi-step tour writes exactly once when the write keeps failing', async () => {
		mockPreferencesRead();
		const write = mockFailingPreferencesWrite();

		const { recordTracksEvent } = renderTour( [
			{ id: 'step-1', title: 'Step 1', description: 'First' },
			{ id: 'step-2', title: 'Step 2', description: 'Second' },
		] );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Next' } ) );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Finish' } ) );

		await waitFor( () => expect( write.count ).toBe( 1 ) );
		await settle();

		expect( write.count ).toBe( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_end_tour', {
			tour_id: TOUR_ID,
			is_completed: true,
		} );
	} );

	test( 'skipping a tour records is_completed:false and writes exactly once', async () => {
		mockPreferencesRead();
		const write = mockFailingPreferencesWrite();

		const { recordTracksEvent } = renderTour(
			[
				{ id: 'step-1', title: 'Step 1', description: 'First' },
				{ id: 'step-2', title: 'Step 2', description: 'Second' },
			],
			{ isSkippable: true }
		);

		// The skip (X) button has no accessible name; it's the only button besides Next/Previous.
		await screen.findByRole( 'button', { name: 'Next' } );
		const skip = screen.getAllByRole( 'button' ).find( ( button ) => ! button.textContent?.trim() );
		await userEvent.click( skip! );

		await waitFor( () => expect( write.count ).toBe( 1 ) );
		await settle();

		expect( write.count ).toBe( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_end_tour', {
			tour_id: TOUR_ID,
			is_completed: false,
		} );
	} );
} );
