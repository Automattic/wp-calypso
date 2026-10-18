/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { BackupKnownThreats } from '../known-threats';

jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	...jest.requireActual( 'calypso/state/ui/selectors' ),
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );

const BASE = 'https://public-api.wordpress.com';
const SITE_ID = 123;
const LIST_PATH = `/wpcom/v3/sites/${ SITE_ID }/rewind/backups`;
const ACTIVITY_PATH = `/wpcom/v2/sites/${ SITE_ID }/activity/rewindable`;
const THREATS_PATH = `/wpcom/v2/sites/${ SITE_ID }/rewind/backups/200/threats`;

const counts = ( flagged: number, vulnerable = 0 ) => ( {
	malware: flagged,
	database: 0,
	vulnerable,
	ignored: 0,
	flagged,
	fixed: 0,
} );

const mockList = ( backups: unknown[], extra = {} ) =>
	nock( BASE )
		.get( LIST_PATH )
		.query( true )
		.reply( 200, {
			ok: true,
			totalItems: backups.length,
			totalPages: 1,
			page: 1,
			itemsPerPage: 100,
			backups,
			...extra,
		} );

const mockActivities = ( rewindIds: string[] ) =>
	nock( BASE )
		.get( ACTIVITY_PATH )
		.query( true )
		.reply( 200, {
			itemsPerPage: 1000,
			page: 1,
			totalItems: 1,
			totalPages: 1,
			current: {
				totalItems: 1,
				orderedItems: rewindIds.map( ( rewind_id ) => ( {
					activity_id: `activity-${ rewind_id }`,
					name: 'rewind__backup_complete_full',
					summary: 'Backup complete',
					published: '2026-10-17T14:28:00.000+00:00',
					is_rewindable: true,
					rewind_id,
					type: 'Announce',
				} ) ),
			},
		} );

const backupWith = ( knownThreats?: ReturnType< typeof counts > ) => ( {
	status: 'finished',
	is_rewindable: true,
	summary: '',
	object: {
		backup_period: '200',
		...( knownThreats ? { known_threats: knownThreats } : {} ),
	},
} );

const localDate = ( utcMs: number ) =>
	new Intl.DateTimeFormat( 'en-US', { dateStyle: 'medium' } ).format( new Date( utcMs ) );

const threatsBody = {
	backup_id: 200,
	cutoff: 200,
	summary: counts( 1, 2 ),
	count: 2,
	truncated: false,
	threats: [
		{
			id: 2,
			state: 'open',
			kind: 'malware',
			signature: 'Eicar.Test',
			path_kind: 'file',
			type: 'file',
			target: 'eicar-standard.php',
			path: 'wp-content/plugins/rf-known-threats-test/eicar-standard.php',
			status: 'ignored',
			reported_on: '2026-10-01 23:30:00',
			fixed_on: null,
		},
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
};

describe( 'BackupKnownThreats', () => {
	beforeEach( () => {
		( siteHasFeature as jest.Mock ).mockReturnValue( true );
	} );
	afterEach( () => nock.cleanAll() );

	const renderIt = () =>
		renderWithProvider( <BackupKnownThreats siteId={ SITE_ID } rewindId="200.5" /> );

	it( 'shows the badge when flagged threats exist', async () => {
		mockList( [ backupWith( counts( 3 ) ) ] );
		renderIt();
		expect( await screen.findByText( 'Known threats (3)' ) ).toBeVisible();
	} );

	it( 'renders nothing before VaultPress ships', async () => {
		const scope = mockList( [ backupWith() ] );
		const { container } = renderIt();
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( scope.isDone() ).toBe( true );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing on request errors', async () => {
		nock( BASE ).get( LIST_PATH ).query( true ).reply( 500, {} );
		const { container } = renderIt();
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'expands a threats table for Scan sites', async () => {
		mockList( [ backupWith( counts( 1, 2 ) ) ], { latest_without_known_threats: 150 } );
		mockActivities( [ '150.817' ] );
		const details = nock( BASE ).get( THREATS_PATH ).query( true ).reply( 200, threatsBody );
		renderIt();

		const toggle = await screen.findByRole( 'button', {
			name: 'Known threats (1), show threats',
		} );
		expect( toggle ).toHaveTextContent( 'Known threats (1)' );
		expect( screen.queryByRole( 'button', { name: 'Show threats' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Show threats' ) ).not.toBeInTheDocument();
		await userEvent.hover( toggle );
		expect( await screen.findByText( 'Show threats' ) ).toBeVisible();
		await userEvent.unhover( toggle );
		expect( toggle ).toHaveClass( 'is-next-40px-default-size' );
		expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( toggle.querySelector( '.gridicons-notice-outline' ) ).toBeInTheDocument();
		// The scss pins this icon to 16px with a rule scoped under the toggle; jsdom has no CSS.
		expect( toggle ).toHaveClass( 'backup-known-threats__toggle' );
		expect( toggle.querySelector( '.backup-known-threats__badge .gridicon' ) ).toHaveAttribute(
			'width',
			'16'
		);
		const restoreLink = await screen.findByRole( 'link', { name: /^Restore .+ backup instead$/ } );
		expect( restoreLink ).toBeVisible();
		expect(
			restoreLink.compareDocumentPosition( toggle ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		await userEvent.click( toggle );

		expect( await screen.findByText( 'Evil.Sig' ) ).toBeVisible();
		expect( screen.getByText( 'wp-content/evil.php' ) ).toBeVisible();
		expect(
			screen.getByText( 'wp-content/plugins/rf-known-threats-test/eicar-standard.php' )
		).toBeVisible();
		expect( screen.queryByText( 'eicar-standard.php' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Open' ) ).toBeVisible();
		expect( screen.getByText( 'Ignored' ) ).toBeVisible();
		expect( screen.getAllByText( localDate( Date.UTC( 2026, 9, 1, 23, 30 ) ) ) ).toHaveLength( 2 );
		expect( screen.getByText( 'Also: 2 vulnerable plugin or theme versions.' ) ).toBeVisible();
		expect( screen.getAllByRole( 'link', { name: /^Restore .+ backup instead$/ } ) ).toHaveLength(
			1
		);
		expect( screen.getByRole( 'link', { name: /^Restore .+ backup instead$/ } ) ).toHaveAttribute(
			'href',
			'/backup/example.wordpress.com/restore/150.817'
		);
		expect( screen.getByRole( 'link', { name: /^Restore .+ backup instead$/ } ) ).toHaveClass(
			'is-next-40px-default-size'
		);
		const expanded = screen.getByRole( 'button', { name: 'Known threats (1), hide threats' } );
		expect( expanded ).toHaveAttribute( 'aria-expanded', 'true' );
		await userEvent.unhover( expanded );
		await userEvent.hover( expanded );
		expect( await screen.findByText( 'Hide threats' ) ).toBeVisible();
		expect( details.isDone() ).toBe( true );
	} );

	it( 'links to the backup activity rewind id, not the bare period', async () => {
		mockList( [ backupWith( counts( 1 ) ) ], { latest_without_known_threats: 1792247305 } );
		const activities = mockActivities( [ '1792247404.817' ] );
		renderIt();

		const link = await screen.findByRole( 'link', {
			name: 'Restore Oct 17, 2026 at 2:30 PM backup instead',
		} );
		expect( link ).toHaveAttribute(
			'href',
			'/backup/example.wordpress.com/restore/1792247404.817'
		);
		expect( activities.isDone() ).toBe( true );
	} );

	it( 'only queries successful backups up to the next backup and never links to it', async () => {
		const period = ( backup_period: string, knownThreats?: ReturnType< typeof counts > ) => ( {
			...backupWith( knownThreats ),
			object: {
				backup_period,
				...( knownThreats ? { known_threats: knownThreats } : {} ),
			},
		} );
		mockList(
			[ period( '1792333705', counts( 1 ) ), period( '1792290505' ), period( '1792247305' ) ],
			{ latest_without_known_threats: 1792247305 }
		);
		let query: Record< string, string | string[] > = {};
		const activities = nock( BASE )
			.get( ACTIVITY_PATH )
			.query( ( q ) => {
				query = q as Record< string, string | string[] >;
				return true;
			} )
			.reply( 200, {
				itemsPerPage: 1000,
				page: 1,
				totalItems: 1,
				totalPages: 1,
				current: {
					totalItems: 1,
					orderedItems: [
						{
							activity_id: 'next-backup',
							name: 'rewind__backup_complete_full',
							summary: 'Backup complete',
							published: '2026-10-17T14:28:00.000+00:00',
							is_rewindable: true,
							rewind_id: '1792290600.4',
							type: 'Announce',
						},
					],
				},
			} );
		renderWithProvider( <BackupKnownThreats siteId={ SITE_ID } rewindId="1792333800.1" /> );

		await screen.findByText( 'Known threats (1)' );
		await waitFor( () => expect( activities.isDone() ).toBe( true ) );
		expect( query[ 'name[]' ] ).toContain( 'rewind__backup_complete_full' );
		expect( query.aggregate ).toBe( 'false' );
		expect( query.sort_order ).toBe( 'asc' );
		expect( query.before ).toBe( new Date( 1792290505 * 1000 ).toISOString() );
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( screen.queryByRole( 'link', { name: /^Restore .+ backup instead$/ } ) ).toBeNull();
	} );

	it( 'hides the restore link when the latest clean backup is the one containing this activity', async () => {
		mockList( [ backupWith( counts( 1 ) ) ], { latest_without_known_threats: 200 } );
		const activities = mockActivities( [ '200.817' ] );
		renderWithProvider( <BackupKnownThreats siteId={ SITE_ID } rewindId="300.5" /> );

		await screen.findByText( 'Known threats (1)' );
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( screen.queryByRole( 'link', { name: /^Restore .+ backup instead$/ } ) ).toBeNull();
		expect( activities.isDone() ).toBe( false );
	} );

	it( 'shows no restore link when no activity matches the backup period', async () => {
		mockList( [ backupWith( counts( 1 ) ) ], { latest_without_known_threats: 1792247305 } );
		const activities = mockActivities( [] );
		renderIt();

		await screen.findByText( 'Known threats (1)' );
		await waitFor( () => expect( activities.isDone() ).toBe( true ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( screen.queryByRole( 'link', { name: /^Restore .+ backup instead$/ } ) ).toBeNull();
	} );

	it( 'does not query activities when the backup has no earlier clean backup', async () => {
		mockList( [ backupWith( counts( 1 ) ) ] );
		const activities = mockActivities( [ '1792247404.817' ] );
		renderIt();

		await screen.findByText( 'Known threats (1)' );
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( activities.isDone() ).toBe( false );
	} );

	it( 'uses the singular vulnerable note for one version', async () => {
		mockList( [ backupWith( counts( 1, 1 ) ) ] );
		nock( BASE )
			.get( THREATS_PATH )
			.query( true )
			.reply( 200, { ...threatsBody, summary: counts( 1, 1 ) } );
		renderIt();

		await userEvent.click( await screen.findByRole( 'button', { name: /show threats/ } ) );

		expect(
			await screen.findByText( 'Also: 1 vulnerable plugin or theme version.' )
		).toBeVisible();
	} );

	it( 'makes no request without a rewind id', async () => {
		const scope = mockList( [ backupWith( counts( 1 ) ) ] );
		const { container } = renderWithProvider( <BackupKnownThreats siteId={ SITE_ID } /> );
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( scope.isDone() ).toBe( false );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'hides the restore link in the clone flow but keeps the table', async () => {
		mockList( [ backupWith( counts( 1 ) ) ], { latest_without_known_threats: 150 } );
		nock( BASE ).get( THREATS_PATH ).query( true ).reply( 200, threatsBody );
		renderWithProvider(
			<BackupKnownThreats siteId={ SITE_ID } rewindId="200.5" showRestoreLink={ false } />
		);
		await userEvent.click( await screen.findByRole( 'button', { name: /show threats/ } ) );
		expect( await screen.findByText( 'Evil.Sig' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /^Restore .+ backup instead$/ } ) ).toBeNull();
	} );

	it( 'shows only the count without Scan and never requests details', async () => {
		( siteHasFeature as jest.Mock ).mockReturnValue( false );
		mockList( [ backupWith( counts( 1 ) ) ] );
		const details = nock( BASE ).get( THREATS_PATH ).query( true ).reply( 200, threatsBody );
		renderIt();

		const badge = await screen.findByText( 'Known threats (1)' );
		expect( badge ).toBeVisible();
		expect( badge ).toHaveClass( 'backup-known-threats__badge' );
		expect( badge.querySelector( '.gridicons-notice-outline' ) ).toBeInTheDocument();
		expect( badge.querySelector( '.gridicons-notice-outline' ) ).toHaveAttribute( 'width', '16' );
		expect( badge.querySelector( '.gridicons-notice-outline' ) ).toHaveAttribute( 'height', '16' );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /show threats/i ) ).not.toBeInTheDocument();
		expect( details.isDone() ).toBe( false );
	} );
} );
