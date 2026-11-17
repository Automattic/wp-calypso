/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import GlobalNotices from 'calypso/components/global-notices';
import agencyReducer from 'calypso/state/a8c-for-agencies/reducer';
import noticesReducer from 'calypso/state/notices/reducer';
import preferencesReducer from 'calypso/state/preferences/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DashboardOptInInvitation from '..';

jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const config = ( key: string ) => actual( key );
	return Object.assign( config, actual, {
		isEnabled: ( flag: string ) => flag === 'a4a-dashboard-opt-in' || actual.isEnabled( flag ),
	} );
} );

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;
const SWITCHED_BACK_AT = '2026-11-01 10:00:00';
const SEEN_PREFERENCE = 'a4a-dashboard-switched-back-note-seen';

function mockMembers( members: Array< { username: string; role: string } > | null ) {
	const scope = nock( API ).get( `/wpcom/v2/agency/${ AGENCY_ID }/users` ).query( true );
	return members ? scope.reply( 200, members ) : scope.reply( 500 );
}

function renderInvitation( { role, seenAt }: { role: string; seenAt?: string } ) {
	nock( API ).put( '/rest/v1.1/me/preferences' ).reply( 200, { calypso_preferences: {} } );
	return renderWithProvider(
		<>
			<GlobalNotices />
			<DashboardOptInInvitation />
		</>,
		{
			queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
			reducers: {
				a8cForAgencies: agencyReducer,
				notices: noticesReducer,
				preferences: preferencesReducer,
			},
			initialState: {
				a8cForAgencies: {
					agencies: {
						isFetching: false,
						activeAgency: {
							id: AGENCY_ID,
							billing_system: 'billingdragon',
							user: { role },
							dashboard_opt_in: { value: 'opt-out', updated_at: SWITCHED_BACK_AT },
						},
					},
				},
				preferences: {
					remoteValues: seenAt ? { [ SEEN_PREFERENCE ]: seenAt } : {},
				},
			},
		}
	);
}

describe( '<DashboardOptInInvitation>', () => {
	test( 'tells a team member which owner switched back', async () => {
		mockMembers( [
			{ username: 'nina', role: 'a4a_manager' },
			{ username: 'owner_sam', role: 'a4a_administrator' },
		] );

		renderInvitation( { role: 'a4a_manager' } );

		expect(
			await screen.findByText(
				'Your agency owner owner_sam switched back to the classic dashboard. Reach out to them if you’d like to try the new dashboard again.'
			)
		).toBeVisible();
	} );

	test( 'still tells a team member when the team list cannot be loaded', async () => {
		mockMembers( null );

		renderInvitation( { role: 'a4a_manager' } );

		expect(
			await screen.findByText(
				'Your agency owner switched back to the classic dashboard. Reach out to them if you’d like to try the new dashboard again.'
			)
		).toBeVisible();
	} );

	test( 'tells the owner without fetching the team', async () => {
		const members = mockMembers( [ { username: 'owner_sam', role: 'a4a_administrator' } ] );

		renderInvitation( { role: 'a4a_administrator' } );

		expect(
			await screen.findByText(
				'You’re back on the classic dashboard. You can enable the new dashboard again any time from Helpful links on this page.'
			)
		).toBeVisible();
		expect( members.isDone() ).toBe( false );
	} );

	test( 'stays quiet once the switch back has been seen', async () => {
		mockMembers( [ { username: 'owner_sam', role: 'a4a_administrator' } ] );

		renderInvitation( { role: 'a4a_manager', seenAt: SWITCHED_BACK_AT } );

		await waitFor( () => expect( screen.queryByText( /classic dashboard/ ) ).toBeNull() );
	} );
} );
