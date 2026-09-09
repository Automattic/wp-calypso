/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import SiteMigrationReview from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StaticSiteImportState } from '@automattic/api-core';

const SESSION_ID = 'sessionabc123';
const ARCHIVE_HASH = 'a'.repeat( 64 );
const SOURCE_URL = 'https://terraandtwine.com';

const flowState: Record< string, unknown > = {};

jest.mock( '../../../state-manager/store', () => ( {
	useFlowState: () => ( {
		get: ( key: string ) => flowState[ key ],
		set: ( key: string, value: unknown ) => {
			flowState[ key ] = value;
		},
		sessionId: null,
	} ),
} ) );

const SESSION_PATH = `/wpcom/v2/static-site-import-session/${ SESSION_ID }`;

const sessionBody = ( state: StaticSiteImportState, extra: Record< string, unknown > = {} ) => ( {
	session_id: SESSION_ID,
	status: 'new',
	state,
	source_digest: 'c'.repeat( 64 ),
	site_url: 'https://example.wordpress.com/',
	...extra,
} );

const mockSession = ( state: StaticSiteImportState, extra: Record< string, unknown > = {} ) =>
	nock( 'https://public-api.wordpress.com:443' )
		.persist()
		.get( SESSION_PATH )
		.query( true )
		.reply( 200, sessionBody( state, extra ) );

const render = ( { search, ...props }: Partial< StepProps > & { search?: string } = {} ) => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );

	const combinedProps = mockStepProps( {
		stepName: 'site-migration-review',
		flow: 'site-migration',
		...props,
	} );

	return renderStep(
		<QueryClientProvider client={ queryClient }>
			<SiteMigrationReview { ...combinedProps } />
		</QueryClientProvider>,
		{
			initialEntry: `/site-migration-review?siteId=123&from=${ encodeURIComponent( SOURCE_URL ) }&${
				search ?? ''
			}`,
		}
	);
};

describe( 'SiteMigrationReview', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		Object.keys( flowState ).forEach( ( key ) => delete flowState[ key ] );
	} );

	afterEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'shows what the build found once the read is done', async () => {
		mockSession( 'preview_ready', {
			archive_hash: ARCHIVE_HASH,
			preview_summary: { pages: 12, diagnostics: { total: 3 } },
		} );

		render( { search: `importSessionId=${ SESSION_ID }` } );

		expect( screen.getByRole( 'heading', { name: 'Review your migration' } ) ).toBeVisible();
		expect( screen.getByText( SOURCE_URL ) ).toBeVisible();
		await waitFor( () => expect( screen.getByText( '12 pages' ) ).toBeVisible() );
		expect( screen.getByText( '3 things to check' ) ).toBeVisible();
	} );

	it( 'uses singular wording for a one-page site', async () => {
		mockSession( 'preview_ready', {
			archive_hash: ARCHIVE_HASH,
			preview_summary: { pages: 1, diagnostics: { total: 1 } },
		} );

		render( { search: `importSessionId=${ SESSION_ID }` } );

		await waitFor( () => expect( screen.getByText( '1 page' ) ).toBeVisible() );
		expect( screen.getByText( '1 thing to check' ) ).toBeVisible();
	} );

	it( 'never shows a block count next to a successful import', async () => {
		// `blocks` is the one summary field read from a separate diagnostics envelope
		// in the build report, so it degrades to 0 whenever that envelope is absent.
		// A real import of this site rendered fine and still reported 0.
		mockSession( 'preview_ready', {
			archive_hash: ARCHIVE_HASH,
			preview_summary: { pages: 1, documents: 1, blocks: 0, quality_pass: true },
		} );

		render( { search: `importSessionId=${ SESSION_ID }` } );

		await waitFor( () => expect( screen.getByText( '1 page' ) ).toBeVisible() );
		expect( screen.queryByText( '0 blocks' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /block/i ) ).not.toBeInTheDocument();
	} );

	it( 'says nothing about diagnostics when the build reported none', async () => {
		mockSession( 'preview_ready', {
			archive_hash: ARCHIVE_HASH,
			preview_summary: { pages: 4, diagnostics: { total: 0 } },
		} );

		render( { search: `importSessionId=${ SESSION_ID }` } );

		await waitFor( () => expect( screen.getByText( '4 pages' ) ).toBeVisible() );
		expect( screen.queryByText( '0 things to check' ) ).not.toBeInTheDocument();
	} );

	it( 'takes the session from flow state when the URL does not carry one', async () => {
		flowState[ 'site-migration-capture' ] = { sessionId: SESSION_ID };
		mockSession( 'preview_ready', {
			archive_hash: ARCHIVE_HASH,
			preview_summary: { pages: 12 },
		} );

		render();

		await waitFor( () => expect( screen.getByText( '12 pages' ) ).toBeVisible() );
	} );

	it( 'cannot be submitted while the read is still running', async () => {
		mockSession( 'capturing' );

		render( { search: `importSessionId=${ SESSION_ID }` } );

		await waitFor( () =>
			expect( screen.getByText( 'We’re still reading your site.' ) ).toBeVisible()
		);
		expect( screen.getByRole( 'button', { name: 'Continue to checkout' } ) ).toBeDisabled();
	} );

	it( 'hands the reviewed archive hash to the flow', async () => {
		mockSession( 'preview_ready', { archive_hash: ARCHIVE_HASH } );
		const submit = jest.fn();

		render( { search: `importSessionId=${ SESSION_ID }`, navigation: { submit } } );

		const button = await screen.findByRole( 'button', { name: 'Continue to checkout' } );
		await waitFor( () => expect( button ).toBeEnabled() );
		await userEvent.click( button );

		// Approval is hash-bound, so this is the hash the user actually reviewed.
		expect( submit ).toHaveBeenCalledWith( {
			action: 'migrate',
			sessionId: SESSION_ID,
			archiveHash: ARCHIVE_HASH,
		} );
	} );

	it( 'says nothing was set up and nothing was paid for when the read failed', async () => {
		mockSession( 'failed' );

		render( { search: `importSessionId=${ SESSION_ID }` } );

		await waitFor( () =>
			expect( screen.getByText( 'We couldn’t read your site.' ) ).toBeVisible()
		);
		expect(
			screen.getByText(
				'We couldn’t read your site. Nothing has been set up, and you haven’t paid.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Continue to checkout' } ) ).toBeDisabled();
	} );
} );
