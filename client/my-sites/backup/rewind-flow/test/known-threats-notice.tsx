/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import KnownThreatsNotice, {
	getKnownThreatsTracksProps,
	isRestoreDisabled,
} from '../known-threats-notice';
import BackupRestoreFlow from '../restore';

jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( 'calypso/state/analytics/actions/record', () => ( {
	recordTracksEvent: jest.fn( () => ( { type: 'TEST_NOOP' } ) ),
} ) );
jest.mock( 'calypso/state/selectors/get-rewind-state', () => ( {
	__esModule: true,
	default: () => ( { state: 'active', canAutoconfigure: false } ),
} ) );
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
jest.mock( 'calypso/state/ui/selectors', () => ( {
	...jest.requireActual( 'calypso/state/ui/selectors' ),
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );

const BASE = 'https://public-api.wordpress.com';
const SITE_ID = 123;
const LIST_PATH = `/wpcom/v3/sites/${ SITE_ID }/rewind/backups`;
const THREATS_PATH = `/wpcom/v2/sites/${ SITE_ID }/rewind/backups/200.5/threats`;
const NOTICE =
	'This backup is known to contain 3 security threats. Restoring it may bring malware back to your site.';
const CHECKBOX = 'I understand this backup contains known threats and want to restore it anyway.';

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

	it( 'expands the threats table for Scan sites', async () => {
		mockList( counts( 3 ), { latest_without_known_threats: 150 } );
		nock( BASE ).get( THREATS_PATH ).query( true ).reply( 200, threatsBody );
		renderWithProvider( <Harness /> );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Show threats' } ) );
		expect( await screen.findByText( 'Evil.Sig' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Restore that one instead' } ) ).toHaveAttribute(
			'href',
			'/backup/example.wordpress.com/restore/150'
		);
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
		expect( restoreButton ).toBeDisabled();

		await userEvent.click( screen.getByRole( 'checkbox', { name: CHECKBOX } ) );
		expect( restoreButton ).toBeEnabled();

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
