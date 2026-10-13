/**
 * @jest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import WelcomeBand, {
	WELCOME_BAND_DISMISSED_PREFERENCE,
	useWelcomeBandVisibility,
} from '../welcome-band';
import type { ReactNode } from 'react';

const API = 'https://public-api.wordpress.com';

function mockPreferences( calypso_preferences: Record< string, unknown > = {} ) {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences } );
}

function renderBand( isPending = false ) {
	return render(
		<WelcomeBand
			isPending={ isPending }
			sitesHref="/sites"
			marketplaceHref="/marketplace"
			onScheduleCall={ jest.fn() }
			onTakeTour={ jest.fn() }
			recordTracksEvent={ jest.fn() }
		/>,
		{ queryClient }
	);
}

describe( '<WelcomeBand>', () => {
	afterEach( () => {
		queryClient.clear();
	} );

	test( 'shows the three first steps until it is closed, then stays closed', async () => {
		mockPreferences();
		let savedDismissed: unknown;
		nock( API )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				savedDismissed = body.calypso_preferences?.[ WELCOME_BAND_DISMISSED_PREFERENCE ];
				return true;
			} )
			.query( true )
			.reply( 200, { calypso_preferences: { [ WELCOME_BAND_DISMISSED_PREFERENCE ]: true } } );
		renderBand();

		expect( await screen.findByRole( 'heading', { name: 'Your account is ready' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Connect your first site' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Explore products & hosting' } ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect(
			screen.queryByRole( 'heading', { name: 'Your account is ready' } )
		).not.toBeInTheDocument();
		await waitFor( () => expect( savedDismissed ).toBe( true ) );
	} );

	test( 'does not show once it has been closed', async () => {
		mockPreferences( { [ WELCOME_BAND_DISMISSED_PREFERENCE ]: true } );
		renderBand();

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect(
			screen.queryByRole( 'heading', { name: 'Your account is ready' } )
		).not.toBeInTheDocument();
	} );

	test( 'locks the marketplace step while the account is under review', async () => {
		mockPreferences();
		renderBand( true );

		expect(
			await screen.findByRole( 'heading', { name: 'Welcome to Automattic for Agencies' } )
		).toBeVisible();
		expect( screen.getByText( 'Unlocks when your account is activated' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: 'Explore products & hosting' } )
		).not.toBeInTheDocument();
	} );
} );

describe( 'useWelcomeBandVisibility', () => {
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	afterEach( () => {
		queryClient.clear();
	} );

	test.each( [
		[ 'shows for an agency under review', 'pending', undefined, true ],
		[ 'shows for an agency at Emerging Partner', 'approved', 'emerging-partner', true ],
		[ 'hides for a rejected agency at Emerging Partner', 'rejected', 'emerging-partner', false ],
		[ 'hides for an agency at a higher tier', 'approved', 'agency-partner', false ],
	] as const )( '%s', ( _, approvalStatus, tierId, expected ) => {
		const { result } = renderHook( () => useWelcomeBandVisibility( approvalStatus, tierId ), {
			wrapper,
		} );

		expect( result.current.isEligible ).toBe( expected );
	} );

	test( 'shows the band until it has been closed, so the Pending card only hides meanwhile', async () => {
		mockPreferences();
		const { result: open } = renderHook( () => useWelcomeBandVisibility( 'pending' ), {
			wrapper,
		} );
		await waitFor( () => expect( open.current.isVisible ).toBe( true ) );

		queryClient.clear();
		mockPreferences( { [ WELCOME_BAND_DISMISSED_PREFERENCE ]: true } );
		const { result: closed } = renderHook( () => useWelcomeBandVisibility( 'pending' ), {
			wrapper,
		} );
		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( closed.current.isVisible ).toBe( false );
	} );
} );
