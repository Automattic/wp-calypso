/**
 * @jest-environment jsdom
 */

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import BackupDelta from '../index';

jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( 'calypso/components/data/query-rewind-state', () => () => null );
jest.mock( 'calypso/components/activity-card/toolbar/actions-button', () => () => (
	<button>Actions</button>
) );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset', () => () => 0 );
jest.mock( 'calypso/state/selectors/get-site-timezone-value', () => () => 'UTC' );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	...jest.requireActual( 'calypso/state/ui/selectors' ),
	getSelectedSiteId: () => 123,
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );

const BASE = 'https://public-api.wordpress.com';
const LIST_PATH = '/wpcom/v3/sites/123/rewind/backups';

const backup = ( period, flagged ) => ( {
	status: 'finished',
	is_rewindable: true,
	summary: '',
	object: {
		backup_period: String( period ),
		...( flagged
			? {
					known_threats: {
						malware: flagged,
						database: 0,
						vulnerable: 0,
						ignored: 0,
						flagged,
						fixed: 0,
					},
				}
			: {} ),
	},
} );

describe( 'BackupDelta known threats', () => {
	beforeEach( () => {
		siteHasFeature.mockReturnValue( true );
	} );
	afterEach( () => nock.cleanAll() );

	it( 'badges only flagged backups using a single shared page request', async () => {
		const scope = nock( BASE )
			.get( LIST_PATH )
			.query( true )
			.once()
			.reply( 200, {
				ok: true,
				totalItems: 2,
				totalPages: 1,
				page: 1,
				itemsPerPage: 100,
				backups: [ backup( 200, 3 ), backup( 100, 0 ) ],
			} );

		nock( BASE )
			.get( '/wpcom/v2/sites/123/rewind/backups/200/threats' )
			.query( true )
			.reply( 200, {
				backup_id: 200,
				cutoff: 200,
				summary: { malware: 3, database: 0, vulnerable: 0, ignored: 0, flagged: 3, fixed: 0 },
				count: 1,
				truncated: false,
				threats: [
					{
						id: 1,
						state: 'open',
						kind: 'malware',
						signature: 'Evil.Sig',
						path_kind: 'file',
						type: 'file',
						target: 'wp-content/evil.php',
						status: 'new',
						reported_on: '2026-10-01 23:30:00',
						fixed_on: null,
					},
				],
			} );

		renderWithProvider(
			<BackupDelta
				isToday
				realtimeBackups={ [
					{
						activityId: 'a1',
						rewindId: '200.5',
						activityTs: 1,
						activityIsRewindable: true,
						activityDescription: [],
						activityIcon: 'cloud',
						activityName: 'rewind__backup_complete_full',
						activityTitle: 'Backup complete',
					},
					{
						activityId: 'a2',
						rewindId: '100.5',
						activityTs: 2,
						activityIsRewindable: true,
						activityDescription: [],
						activityIcon: 'cloud',
						activityName: 'rewind__backup_complete_full',
						activityTitle: 'Backup complete',
					},
				] }
			/>
		);

		const button = await screen.findByRole( 'button', {
			name: 'Known threats (3), show threats',
		} );
		const cards = document.querySelectorAll( '.activity-card' );
		expect( cards ).toHaveLength( 2 );
		const toolbar = cards[ 0 ].querySelector( '.activity-card__toolbar--reverse' );
		expect( toolbar ).toContainElement( button );
		expect( toolbar.lastElementChild ).toContainElement( button );
		expect( cards[ 1 ].querySelector( '.activity-card__toolbar--reverse' ) ).not.toBeNull();
		expect( within( cards[ 1 ] ).queryByText( /Known threats/ ) ).toBeNull();

		expect( screen.queryByRole( 'button', { name: 'Show threats' } ) ).toBeNull();
		await userEvent.hover( button );
		expect( await screen.findByText( 'Show threats' ) ).toBeVisible();
		await userEvent.unhover( button );
		await userEvent.click( button );
		expect( button ).toHaveAttribute( 'aria-expanded', 'true' );
		await userEvent.unhover( button );
		await userEvent.hover( button );
		expect( await screen.findByText( 'Hide threats' ) ).toBeVisible();
		expect( await within( cards[ 0 ] ).findByText( 'Evil.Sig' ) ).toBeVisible();
		expect( within( cards[ 1 ] ).queryByText( 'Evil.Sig' ) ).toBeNull();
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( scope.isDone() ).toBe( true );
		expect( scope.pendingMocks() ).toEqual( [] );
		expect( nock.pendingMocks() ).toEqual( [] );
	} );

	it( 'still renders the empty-day message without realtime backups', () => {
		renderWithProvider( <BackupDelta isToday={ false } realtimeBackups={ [] } /> );
		expect(
			screen.getByText( 'There were no changes on this day. Your daily backup is above.' )
		).toBeVisible();
	} );
} );
