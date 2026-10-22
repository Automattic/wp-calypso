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
				latest_without_known_threats: 100,
				backups: [ backup( 200, 3 ), backup( 100, 0 ) ],
			} );

		nock( BASE )
			.get( '/wpcom/v2/sites/123/activity/rewindable' )
			.query( true )
			.reply( 200, {
				itemsPerPage: 1000,
				page: 1,
				totalItems: 1,
				totalPages: 1,
				current: {
					totalItems: 1,
					orderedItems: [
						{
							activity_id: 'a-100',
							name: 'rewind__backup_complete_full',
							summary: 'Backup complete',
							published: '2026-10-01T10:00:00.000+00:00',
							is_rewindable: true,
							rewind_id: '100.9',
							type: 'Announce',
						},
					],
				},
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
			name: 'Show threats',
		} );
		const cards = document.querySelectorAll( '.activity-card' );
		expect( cards ).toHaveLength( 2 );
		const toolbar = cards[ 0 ].querySelector( '.activity-card__toolbar--reverse' );
		expect( toolbar ).toContainElement( button );
		expect( toolbar.lastElementChild ).toContainElement( button );
		expect( cards[ 1 ].querySelector( '.activity-card__toolbar--reverse' ) ).not.toBeNull();
		expect( within( cards[ 1 ] ).queryByText( /Known threats/ ) ).toBeNull();

		const warning =
			'This backup is known to contain 3 security threats. Restoring it may bring malware back to your site.';
		expect( button ).toHaveAccessibleDescription( warning );
		expect( button ).not.toHaveAttribute( 'title' );
		expect( button ).not.toHaveAccessibleDescription( 'Show threats' );
		// The badge isn't interactive, so no tooltip; the toggle keeps the warning as its description.
		const badge = within( cards[ 0 ] ).getByText( 'Known threats (3)' );
		await userEvent.hover( badge );
		expect( screen.queryByRole( 'tooltip' ) ).toBeNull();
		await userEvent.unhover( badge );
		const restoreLink = await within( cards[ 0 ] ).findByRole( 'link', {
			name: /^Restore .+ backup instead$/,
		} );
		expect( restoreLink ).toBeVisible();
		// The toggle stays in the card toolbar; the link sits below it, under the toolbar row.
		expect( toolbar ).not.toContainElement( restoreLink );
		expect(
			button.compareDocumentPosition( restoreLink ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			within( cards[ 1 ] ).queryByRole( 'link', { name: /^Restore .+ backup instead$/ } )
		).toBeNull();
		await userEvent.click( button );
		expect( button ).toHaveAttribute( 'aria-expanded', 'true' );
		await userEvent.unhover( button );
		expect( button ).not.toHaveAccessibleDescription( 'Hide threats' );
		expect( await within( cards[ 0 ] ).findByText( 'Evil.Sig' ) ).toBeVisible();
		// The list opens right below the toggle's row, full width, and above the link.
		const list = within( cards[ 0 ] ).getByRole( 'list', {
			name: 'Known threats in this backup',
		} );
		expect( toolbar ).not.toContainElement( list );
		expect( toolbar.nextElementSibling ).toContainElement( list );
		// Opened, the card shows the warning above the list.
		const shownWarning = within( toolbar.nextElementSibling ).getByText( warning );
		expect( shownWarning ).toBeVisible();
		expect( shownWarning.compareDocumentPosition( list ) ).toBe( Node.DOCUMENT_POSITION_FOLLOWING );
		expect(
			list.compareDocumentPosition( restoreLink ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect( within( cards[ 1 ] ).queryByText( 'Evil.Sig' ) ).toBeNull();
		expect(
			within( cards[ 0 ] ).getAllByRole( 'link', { name: /^Restore .+ backup instead$/ } )
		).toHaveLength( 1 );
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
