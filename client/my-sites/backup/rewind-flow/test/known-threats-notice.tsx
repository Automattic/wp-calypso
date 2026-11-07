/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { speak } from '@wordpress/a11y';
import nock from 'nock';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import BackupGranularRestoreFlow from '../granular-restore';
import KnownThreatsNotice, {
	getKnownThreatsTracksProps,
	isRestoreDisabled,
} from '../known-threats-notice';
import BackupRestoreFlow from '../restore';

jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( '@wordpress/a11y', () => ( {
	...jest.requireActual( '@wordpress/a11y' ),
	speak: jest.fn(),
} ) );
jest.mock( 'calypso/state/analytics/actions/record', () => ( {
	recordTracksEvent: jest.fn( () => ( { type: 'TEST_NOOP' } ) ),
} ) );
jest.mock( 'calypso/state/selectors/get-rewind-state', () => {
	// The same object every time, as the real selector returns from the store.
	const rewindState = { state: 'active', canAutoconfigure: false };
	return { __esModule: true, default: () => rewindState };
} );
function mockSelector( value: unknown ) {
	return { __esModule: true, default: () => value };
}
jest.mock( 'calypso/state/jetpack/credentials/selectors', () => ( {
	areJetpackCredentialsInvalid: () => false,
	hasJetpackCredentials: () => true,
} ) );
jest.mock( 'calypso/state/rewind/preflight/hooks', () => ( {
	usePreflightStatusQuery: () => ( { refetch: jest.fn() } ),
	useEnqueuePreflightCheck: () => ( { mutate: jest.fn() } ),
} ) );
jest.mock( 'calypso/state/rewind/preflight/selectors', () => ( {
	getPreflightStatus: () => null,
} ) );
jest.mock( 'calypso/state/rewind/selectors', () => ( { getInProgressBackupForSite: () => null } ) );
jest.mock( 'calypso/state/selectors/get-does-rewind-need-credentials', () =>
	mockSelector( false )
);
jest.mock( 'calypso/state/selectors/get-in-progress-rewind-status', () => mockSelector( null ) );
jest.mock( 'calypso/state/selectors/get-is-restore-in-progress', () => mockSelector( false ) );
jest.mock( 'calypso/state/selectors/get-restore-progress', () => mockSelector( null ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => mockSelector( true ) );
jest.mock( 'calypso/blocks/jetpack-review-prompt', () => () => null );
jest.mock( 'calypso/components/data/query-jetpack-credentials-status', () => () => null );
jest.mock( 'calypso/components/data/query-rewind-backups', () => () => null );
jest.mock( 'calypso/components/data/query-rewind-restore-status', () => () => null );
jest.mock( 'calypso/components/data/query-rewind-state', () => () => null );
jest.mock(
	'calypso/my-sites/backup/backup-contents-page/file-browser/file-browser-context',
	() => ( {
		useFileBrowserContext: () => ( {
			fileBrowserState: {
				getCheckList: () => ( {
					includeList: [ { id: 'f1', path: '/wp-content/a.php' } ],
					excludeList: [],
					totalItems: 1,
				} ),
				getSelectedList: () => [ { id: 'f1', type: 'file', path: '/wp-content/a.php' } ],
			},
		} ),
	} )
);
jest.mock( 'calypso/state/ui/selectors', () => ( {
	...jest.requireActual( 'calypso/state/ui/selectors' ),
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );

const BASE = 'https://public-api.wordpress.com';
const SITE_ID = 123;
const LIST_PATH = `/wpcom/v3/sites/${ SITE_ID }/rewind/backups`;
const ACTIVITY_PATH = `/wpcom/v2/sites/${ SITE_ID }/activity/rewindable`;
const THREATS_PATH = `/wpcom/v2/sites/${ SITE_ID }/rewind/backups/200/threats`;
const NOTICE =
	'This backup is known to contain 3 security threats. Restoring it may bring malware back to your site.';
const CHECKBOX = 'I understand this backup contains known threats and want to restore it anyway.';

const expectInOrder = ( ...elements: HTMLElement[] ) =>
	elements
		.slice( 1 )
		.forEach( ( element, index ) =>
			expect(
				elements[ index ].compareDocumentPosition( element ) & Node.DOCUMENT_POSITION_FOLLOWING
			).toBeTruthy()
		);

const counts = ( flagged: number ) => ( {
	malware: flagged,
	database: 0,
	vulnerable: 0,
	ignored: 0,
	flagged,
	fixed: 0,
} );

const mockList = ( knownThreats?: ReturnType< typeof counts >, extra = {} ) =>
	nock( BASE )
		.get( LIST_PATH )
		.query( true )
		.reply( 200, {
			ok: true,
			totalItems: 1,
			totalPages: 1,
			page: 1,
			itemsPerPage: 100,
			backups: [
				{
					status: 'finished',
					is_rewindable: true,
					summary: '',
					object: {
						backup_period: '200',
						...( knownThreats ? { known_threats: knownThreats } : {} ),
					},
				},
			],
			...extra,
		} );

const threatsBody = {
	backup_id: 200,
	cutoff: 200,
	summary: counts( 1 ),
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

const getBanner = () => screen.getByText( NOTICE ).closest( '.rewind-flow-notice' );

function Harness( { onChange }: { onChange?: ( value: boolean ) => void } ) {
	const [ acknowledged, setAcknowledged ] = useState( false );
	return (
		<KnownThreatsNotice
			siteId={ SITE_ID }
			rewindId="200.5"
			requireAcknowledgement
			acknowledged={ acknowledged }
			onAcknowledgedChange={ setAcknowledged }
			onKnownThreatsChange={ onChange }
		/>
	);
}

describe( 'KnownThreatsNotice', () => {
	beforeEach( () => {
		( siteHasFeature as jest.Mock ).mockReturnValue( true );
	} );
	afterEach( () => nock.cleanAll() );

	it( 'shows the warning and a checkbox that reports changes', async () => {
		mockList( counts( 3 ) );
		const onChange = jest.fn();
		renderWithProvider( <Harness onChange={ onChange } /> );

		expect( await screen.findByText( NOTICE ) ).toBeVisible();
		const checkbox = screen.getByRole( 'checkbox', { name: CHECKBOX } );
		expect( checkbox.closest( '.rewind-flow-notice' ) ).toBe( getBanner() );
		expect( checkbox ).not.toBeChecked();
		await userEvent.click( checkbox );
		expect( checkbox ).toBeChecked();
		expect( onChange ).toHaveBeenLastCalledWith( true );
	} );

	it( 'uses the singular for one threat', async () => {
		mockList( counts( 1 ) );
		renderWithProvider( <Harness /> );

		expect(
			await screen.findByText(
				'This backup is known to contain 1 security threat. Restoring it may bring malware back to your site.'
			)
		).toBeVisible();
	} );

	it( 'shows no checkbox when acknowledgement is not required', async () => {
		mockList( counts( 3 ) );
		renderWithProvider(
			<KnownThreatsNotice siteId={ SITE_ID } rewindId="200.5" requireAcknowledgement={ false } />
		);
		expect( await screen.findByText( NOTICE ) ).toBeVisible();
		expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing and reports false before VaultPress ships', async () => {
		const scope = mockList();
		const onChange = jest.fn();
		const { container } = renderWithProvider( <Harness onChange={ onChange } /> );
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( scope.isDone() ).toBe( true );
		expect( container ).toBeEmptyDOMElement();
		expect( onChange ).toHaveBeenLastCalledWith( false );
		expect( onChange ).not.toHaveBeenCalledWith( true );
	} );

	it( 'renders nothing on errors', async () => {
		nock( BASE ).get( LIST_PATH ).query( true ).reply( 500, {} );
		const onChange = jest.fn();
		const { container } = renderWithProvider( <Harness onChange={ onChange } /> );
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		expect( container ).toBeEmptyDOMElement();
		expect( onChange ).not.toHaveBeenCalledWith( true );
	} );

	it( 'expands the threats list for Scan sites', async () => {
		mockList( counts( 3 ), { latest_without_known_threats: 150 } );
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
					orderedItems: [
						{
							activity_id: 'a-150',
							name: 'rewind__backup_complete_full',
							summary: 'Backup complete',
							published: '2026-10-01T10:00:00.000+00:00',
							is_rewindable: true,
							rewind_id: '150.817',
							type: 'Announce',
						},
					],
				},
			} );
		nock( BASE ).get( THREATS_PATH ).query( true ).reply( 200, threatsBody );
		renderWithProvider( <Harness /> );
		const toggle = await screen.findByRole( 'button', { name: 'Show threats' } );
		expect( toggle ).toHaveClass( 'is-next-40px-default-size' );
		expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		// Not the badge: no warning icon, only the chevron.
		expect( toggle.querySelectorAll( 'svg' ) ).toHaveLength( 1 );
		expect( toggle.closest( '.rewind-flow-known-threats__details' ) ).toBeInTheDocument();
		// The banner already says how many threats there are, so no badge repeats it.
		expect( screen.queryByText( 'Known threats (3)' ) ).not.toBeInTheDocument();
		const banner = screen.getByText( NOTICE ).closest( '.rewind-flow-notice' );
		expect( banner ).toBeInTheDocument();
		expect( banner ).toContainElement( toggle );
		expect( banner ).toContainElement( screen.getByRole( 'checkbox', { name: CHECKBOX } ) );
		expect( toggle ).not.toHaveAccessibleDescription( 'Show threats' );
		await userEvent.unhover( toggle );
		await userEvent.click( toggle );
		expect( await screen.findByText( 'Evil.Sig' ) ).toBeVisible();
		const expanded = screen.getByRole( 'button', { name: 'Hide threats' } );
		expect( expanded ).toHaveAttribute( 'aria-expanded', 'true' );
		await userEvent.unhover( expanded );
		expect( expanded ).not.toHaveAccessibleDescription( 'Hide threats' );
		const link = await screen.findByRole( 'link', { name: /^Restore .+ backup instead$/ } );
		expect( link ).toHaveAttribute( 'href', '/backup/example.wordpress.com/restore/150.817' );
		expect( banner ).toContainElement( link );
		expect( banner ).toContainElement( screen.getByText( 'Evil.Sig' ) );
		expectInOrder( expanded, screen.getByText( 'Evil.Sig' ), link );
		expect( screen.getAllByRole( 'link', { name: /^Restore .+ backup instead$/ } ) ).toHaveLength(
			1
		);
	} );

	it( 'points the toggle at a loading, then failed, threats region while open', async () => {
		mockList( counts( 3 ) );
		nock( BASE ).get( THREATS_PATH ).query( true ).delay( 300 ).reply( 500, {} );
		renderWithProvider( <Harness /> );

		const toggle = await screen.findByRole( 'button', { name: 'Show threats' } );
		expect( toggle ).not.toHaveAttribute( 'aria-controls' );
		await userEvent.click( toggle );

		const region = () => document.getElementById( toggle.getAttribute( 'aria-controls' ) ?? '' );
		expect( region() ).toContainElement( await screen.findByText( 'Loading threats…' ) );
		expect( region() ).toContainElement(
			await screen.findByText( "Couldn't load the threats. Try again later." )
		);

		await userEvent.click( toggle );
		expect( toggle ).not.toHaveAttribute( 'aria-controls' );
	} );

	it( 'has no expander and no details request without Scan, but keeps the checkbox', async () => {
		( siteHasFeature as jest.Mock ).mockReturnValue( false );
		mockList( counts( 3 ) );
		const details = nock( BASE ).get( THREATS_PATH ).query( true ).reply( 200, threatsBody );
		renderWithProvider( <Harness /> );
		expect( await screen.findByText( NOTICE ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /threats/ } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'checkbox', { name: CHECKBOX } ) ).toBeVisible();
		expect( details.isDone() ).toBe( false );
	} );
} );

describe( 'isRestoreDisabled', () => {
	it.each( [
		[ false, false, false, false ],
		[ false, true, false, true ],
		[ false, true, true, false ],
		[ true, false, false, true ],
		[ true, true, false, true ],
		[ true, true, true, true ],
	] )(
		'noSelection=%s threats=%s acknowledged=%s -> %s',
		( noSelection, threats, ack, expected ) => {
			expect( isRestoreDisabled( noSelection, threats, ack ) ).toBe( expected );
		}
	);
} );

describe( 'getKnownThreatsTracksProps', () => {
	it( 'reports shown and acknowledged', () => {
		expect( getKnownThreatsTracksProps( true, true ) ).toEqual( {
			known_threats_shown: true,
			known_threats_acknowledged: true,
		} );
		expect( getKnownThreatsTracksProps( false, true ) ).toEqual( {
			known_threats_shown: false,
			known_threats_acknowledged: false,
		} );
		expect( getKnownThreatsTracksProps( true, false ) ).toEqual( {
			known_threats_shown: true,
			known_threats_acknowledged: false,
		} );
	} );
} );

describe( 'BackupRestoreFlow known threats gating', () => {
	beforeEach( () => {
		( siteHasFeature as jest.Mock ).mockReturnValue( true );
		( recordTracksEvent as jest.Mock ).mockClear();
	} );
	afterEach( () => nock.cleanAll() );

	it( 'disables Restore now until acknowledged and records the Tracks props', async () => {
		mockList( counts( 3 ) );
		renderWithProvider(
			<BackupRestoreFlow
				backup={ {} }
				backupDisplayDate="October 1, 2026"
				rewindId="200.5"
				siteId={ SITE_ID }
				siteUrl="https://example.wordpress.com"
			/>
		);

		const restoreButton = screen.getByRole( 'button', { name: 'Restore now' } );
		await screen.findByText( NOTICE );
		expect( restoreButton ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( restoreButton ).not.toHaveAttribute( 'disabled' );
		expect( restoreButton ).toHaveAccessibleDescription(
			'To restore this backup, confirm that you understand it contains known threats.'
		);
		// Shown as text, not in a tooltip.
		expect(
			screen.getByText(
				'To restore this backup, confirm that you understand it contains known threats.'
			)
		).toBeVisible();
		await userEvent.click( restoreButton );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_jetpack_backup_restore_confirm',
			expect.anything()
		);

		await userEvent.click( screen.getByRole( 'checkbox', { name: CHECKBOX } ) );
		expect( restoreButton ).toBeEnabled();
		expect( restoreButton ).not.toHaveAttribute( 'aria-disabled' );
		expect( restoreButton ).not.toHaveAccessibleDescription();
		// "Go back" is the next stop, so the announcement says where Restore now is.
		expectInOrder(
			screen.getByRole( 'checkbox', { name: CHECKBOX } ),
			screen.getByRole( 'link', { name: 'Go back' } ),
			restoreButton
		);
		expect( speak ).toHaveBeenLastCalledWith(
			'You can now restore this backup with "Restore now", below.'
		);

		await userEvent.click( restoreButton );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_jetpack_backup_restore_confirm',
			expect.objectContaining( {
				known_threats_shown: true,
				known_threats_acknowledged: true,
			} )
		);
	} );
} );

describe( 'BackupGranularRestoreFlow known threats gating', () => {
	beforeEach( () => {
		( siteHasFeature as jest.Mock ).mockReturnValue( true );
		( recordTracksEvent as jest.Mock ).mockClear();
	} );
	afterEach( () => nock.cleanAll() );

	it( 'disables Restore now until acknowledged and records the Tracks props', async () => {
		mockList( counts( 3 ) );
		renderWithProvider(
			<BackupGranularRestoreFlow
				backupDisplayDate="October 1, 2026"
				rewindId="200.5"
				siteId={ SITE_ID }
				siteUrl="https://example.wordpress.com"
			/>
		);

		await screen.findByText( NOTICE );
		const restoreButton = screen.getByRole( 'button', { name: 'Restore now' } );
		expect( restoreButton ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( restoreButton ).not.toHaveAttribute( 'disabled' );
		expect( restoreButton ).toHaveAccessibleDescription(
			'To restore this backup, confirm that you understand it contains known threats.'
		);
		// Shown as text, not in a tooltip.
		expect(
			screen.getByText(
				'To restore this backup, confirm that you understand it contains known threats.'
			)
		).toBeVisible();
		await userEvent.click( restoreButton );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_jetpack_granular_restore_confirm',
			expect.anything()
		);

		await userEvent.click( screen.getByRole( 'checkbox', { name: CHECKBOX } ) );
		expect( restoreButton ).toBeEnabled();
		expect( restoreButton ).not.toHaveAttribute( 'aria-disabled' );
		expect( restoreButton ).not.toHaveAccessibleDescription();
		// "Cancel" is the next stop, so the announcement says where Restore now is.
		expectInOrder(
			screen.getByRole( 'checkbox', { name: CHECKBOX } ),
			screen.getByRole( 'link', { name: 'Cancel' } ),
			restoreButton
		);
		expect( speak ).toHaveBeenLastCalledWith(
			'You can now restore this backup with "Restore now", below.'
		);

		await userEvent.click( restoreButton );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_jetpack_granular_restore_confirm',
			expect.objectContaining( {
				known_threats_shown: true,
				known_threats_acknowledged: true,
			} )
		);
	} );
} );
