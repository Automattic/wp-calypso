/**
 * @jest-environment jsdom
 */
import { queryClient } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import WelcomeBand, {
	WELCOME_BAND_DISMISSED_PREFERENCE,
	useWelcomeBandVisibility,
} from '../welcome-band';
import type { AgencyTierType } from '../../tiers/types';
import type { AgencyApprovalStatus } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

function mockPreferences( calypso_preferences: Record< string, unknown > = {} ) {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences } );
}

// In the API's format, "YYYY-MM-DD HH:MM:SS".
const daysAgo = ( days: number ) =>
	new Date( Date.now() - days * 24 * 60 * 60 * 1000 )
		.toISOString()
		.slice( 0, 19 )
		.replace( 'T', ' ' );

interface AgencyProps {
	approvalStatus?: AgencyApprovalStatus;
	tierId?: AgencyTierType;
	createdAt?: string;
}

// Shows the band the way Overview does.
function Band( { approvalStatus, tierId, createdAt }: AgencyProps ) {
	const { isVisible } = useWelcomeBandVisibility( approvalStatus, tierId, createdAt );
	return isVisible ? (
		<WelcomeBand
			isPending={ approvalStatus === 'pending' }
			sitesHref="/sites"
			marketplaceHref="/marketplace"
			onScheduleCall={ jest.fn() }
			onTakeTour={ jest.fn() }
			recordTracksEvent={ jest.fn() }
		/>
	) : null;
}

const NEW_EMERGING_PARTNER: AgencyProps = {
	approvalStatus: 'approved',
	tierId: 'emerging-partner',
	createdAt: daysAgo( 10 ),
};

function renderBand( props: AgencyProps = NEW_EMERGING_PARTNER ) {
	return render( <Band { ...props } />, { queryClient } );
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
		renderBand( { approvalStatus: 'pending' } );

		expect(
			await screen.findByRole( 'heading', { name: 'Welcome to Automattic for Agencies' } )
		).toBeVisible();
		expect( screen.getByText( 'Unlocks when your account is activated' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: 'Explore products & hosting' } )
		).not.toBeInTheDocument();
	} );

	test( 'shows for an agency at Emerging Partner that joined recently', async () => {
		mockPreferences();
		renderBand();

		expect( await screen.findByRole( 'heading', { name: 'Your account is ready' } ) ).toBeVisible();
	} );

	test.each( [
		[
			'an agency at Emerging Partner that joined over 60 days ago',
			{ ...NEW_EMERGING_PARTNER, createdAt: daysAgo( 90 ) },
		],
		[ 'a rejected agency', { ...NEW_EMERGING_PARTNER, approvalStatus: 'rejected' } ],
		[ 'an agency at a higher tier', { ...NEW_EMERGING_PARTNER, tierId: 'agency-partner' } ],
	] as const )( 'does not show for %s', async ( _, props ) => {
		mockPreferences();
		renderBand( props );

		await expect(
			screen.findByRole( 'heading', { level: 2 }, { timeout: 200 } )
		).rejects.toThrow();
	} );
} );
