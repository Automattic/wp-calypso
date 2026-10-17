/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
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
const THREATS_PATH = `/wpcom/v2/sites/${ SITE_ID }/rewind/backups/200.5/threats`;

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
		const details = nock( BASE ).get( THREATS_PATH ).query( true ).reply( 200, threatsBody );
		renderIt();

		const toggle = await screen.findByRole( 'button', { name: /Show threats/ } );
		expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		await userEvent.click( toggle );

		expect( await screen.findByText( 'Evil.Sig' ) ).toBeVisible();
		expect( screen.getByText( 'wp-content/evil.php' ) ).toBeVisible();
		expect( screen.getByText( 'Open' ) ).toBeVisible();
		expect( screen.getByText( localDate( Date.UTC( 2026, 9, 1, 23, 30 ) ) ) ).toBeVisible();
		expect( screen.getByText( 'Also: 2 vulnerable plugin or theme versions.' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Restore that one instead' } ) ).toHaveAttribute(
			'href',
			'/backup/example.wordpress.com/restore/150'
		);
		expect( screen.getByRole( 'button', { name: /Hide threats/ } ) ).toHaveAttribute(
			'aria-expanded',
			'true'
		);
		expect( details.isDone() ).toBe( true );
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
		await userEvent.click( await screen.findByRole( 'button', { name: /Show threats/ } ) );
		expect( await screen.findByText( 'Evil.Sig' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Restore that one instead' } ) ).toBeNull();
	} );

	it( 'shows only the count without Scan and never requests details', async () => {
		( siteHasFeature as jest.Mock ).mockReturnValue( false );
		mockList( [ backupWith( counts( 1 ) ) ] );
		const details = nock( BASE ).get( THREATS_PATH ).query( true ).reply( 200, threatsBody );
		renderIt();

		expect( await screen.findByText( 'Known threats (1)' ) ).toBeVisible();
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /Show threats/ ) ).not.toBeInTheDocument();
		expect( details.isDone() ).toBe( false );
	} );
} );
