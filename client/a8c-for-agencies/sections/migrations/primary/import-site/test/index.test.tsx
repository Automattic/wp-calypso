/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { A4A_MIGRATIONS_IMPORT_SITE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { isPathAllowed } from 'calypso/a8c-for-agencies/lib/permission';
import GlobalNotices from 'calypso/components/global-notices';
import agencyReducer from 'calypso/state/a8c-for-agencies/reducer';
import noticesReducer from 'calypso/state/notices/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ImportSite from '..';

// The page chrome reads unrelated agency state; the behavior under test is the form and modal.
jest.mock( 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour', () => ( {
	LayoutWithGuidedTour: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );
jest.mock(
	'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification',
	() =>
		( { children }: { children: React.ReactNode } ) => <div>{ children }</div>
);
jest.mock(
	'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation',
	() => () => null
);
jest.mock(
	'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name',
	() => ( {
		useRandomSiteName: () => ( {
			randomSiteName: 'agencymove',
			isRandomSiteNameLoading: false,
			refetchRandomSiteName: jest.fn(),
		} ),
	} )
);
jest.mock( '@automattic/calypso-router', () =>
	Object.assign( jest.fn(), { redirect: jest.fn() } )
);

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;
const SESSION_ID = 'a'.repeat( 32 );
let provisionReply: [ number, object ];

function renderPage() {
	nock( API )
		.post( `/wpcom/v2/agency/${ AGENCY_ID }/validate-site-address` )
		.reply( 200, { valid: true } )
		.persist();
	return renderWithProvider(
		<>
			<GlobalNotices />
			<ImportSite />
		</>,
		{
			queryClient: new QueryClient( {
				defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
			} ),
			reducers: { a8cForAgencies: agencyReducer, notices: noticesReducer },
			initialState: {
				a8cForAgencies: { agencies: { isFetching: false, activeAgency: { id: AGENCY_ID } } },
			},
		}
	);
}

async function startImportAndConfirm( provision: ( body: Record< string, unknown > ) => void ) {
	const session = nock( API )
		.post( '/wpcom/v2/static-site-import-session', { source_url: 'https://example.wixsite.com' } )
		.reply( 200, { session_id: SESSION_ID, state: 'capture_queued' } );
	nock( API )
		.post( `/wpcom/v2/agency/${ AGENCY_ID }/sites/provision-dev-site`, ( body ) => {
			provision( body );
			return true;
		} )
		.reply( function () {
			return provisionReply;
		} );

	renderPage();
	await userEvent.type( screen.getByLabelText( 'Site address' ), 'https://example.wixsite.com' );
	await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	await waitFor( () => expect( session.isDone() ).toBe( true ) );
	const create = await screen.findByRole( 'button', { name: 'Create site' } );
	await waitFor( () => expect( create ).toBeEnabled(), { timeout: 5000 } );
	await userEvent.click( create );
}

describe( '<ImportSite>', () => {
	test( 'is a route agency members with migrations access can open', () => {
		const agency = { user: { capabilities: [ 'a4a_read_migrations' ] } };
		expect( isPathAllowed( A4A_MIGRATIONS_IMPORT_SITE_LINK, agency as never ) ).toBe( true );
	} );

	afterEach( () => nock.cleanAll() );

	test( 'provisions a dev site that holds the import and follows it until it is ready', async () => {
		provisionReply = [ 200, { site: { id: 456 }, license: {}, provision: {} } ];
		nock( API ).get( `/wpcom/v2/static-site-import-session/${ SESSION_ID }` ).reply( 200, {
			session_id: SESSION_ID,
			state: 'finished',
			site_url: 'https://agencymove.wpcomstaging.com/',
		} );
		const bodies: Record< string, unknown >[] = [];

		await startImportAndConfirm( ( body ) => bodies.push( body ) );

		await waitFor( () => expect( bodies ).toHaveLength( 1 ) );
		expect( bodies[ 0 ] ).toMatchObject( {
			site_name: 'agencymove',
			import_session_id: SESSION_ID,
		} );
		expect( await screen.findByText( 'Your site is ready to review' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Review the site' } ) ).toHaveAttribute(
			'href',
			'https://agencymove.wpcomstaging.com/'
		);
	} );

	test( 'offers to start again when the import fails on the dev site', async () => {
		provisionReply = [ 200, { site: { id: 456 }, license: {}, provision: {} } ];
		nock( API )
			.get( `/wpcom/v2/static-site-import-session/${ SESSION_ID }` )
			.reply( 200, { session_id: SESSION_ID, state: 'failed', site_url: '' } );

		await startImportAndConfirm( () => {} );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Start again' } ) );
		expect( screen.getByLabelText( 'Site address' ) ).toBeVisible();
	} );

	test.each( [
		[
			'static_site_import_not_site_owner',
			403,
			'Only the agency owner can move a site onto a new development site.',
		],
		[
			'static_site_import_not_approvable',
			409,
			"This import can no longer be used. Start again with the site's address.",
		],
		[
			'static_site_import_session_not_found',
			404,
			"This import can no longer be used. Start again with the site's address.",
		],
	] )( 'explains a %s refusal', async ( code, status, notice ) => {
		provisionReply = [ status, { code, message: code } ];

		await startImportAndConfirm( () => {} );

		expect( await screen.findByText( notice ) ).toBeVisible();
	} );
} );
