/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import SiteMigrationCapture from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StaticSiteImportState } from '@automattic/api-core';

const SESSION_ID = 'sessionabc123';
const SOURCE_URL = 'https://terraandtwine.com';
const ARCHIVE_HASH = 'a'.repeat( 64 );

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

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

// The session is the user's: neither route names a site, which is what lets the
// read start before a destination, a plan or a payment exists.
const CREATE_PATH = '/wpcom/v2/static-site-import-session';
const SESSION_PATH = `${ CREATE_PATH }/${ SESSION_ID }`;

const sessionBody = ( state: StaticSiteImportState, extra: Record< string, unknown > = {} ) => ( {
	session_id: SESSION_ID,
	status: 'new',
	state,
	source_digest: 'c'.repeat( 64 ),
	site_url: 'https://example.wordpress.com/',
	...extra,
} );

const errorBody = ( code: string, status = 409 ) => ( {
	code,
	message: 'Refused.',
	data: { status },
} );

const mockCreate = ( sourceUrl = SOURCE_URL ) =>
	mockApi()
		.post( CREATE_PATH, { source_url: sourceUrl } )
		.query( true )
		.reply( 200, sessionBody( 'capture_queued' ) );

const mockCreateFailure = ( code: string, status = 409 ) =>
	mockApi().post( CREATE_PATH ).query( true ).reply( status, errorBody( code, status ) );

const mockSessionForever = (
	state: StaticSiteImportState,
	extra: Record< string, unknown > = {}
) =>
	mockApi().persist().get( SESSION_PATH ).query( true ).reply( 200, sessionBody( state, extra ) );

const settle = async ( ms: number ) =>
	act( async () => {
		await new Promise( ( resolve ) => setTimeout( resolve, ms ) );
	} );

const render = ( { search, ...props }: Partial< StepProps > & { search?: string } = {} ) => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );

	const combinedProps = mockStepProps( {
		stepName: 'site-migration-capture',
		flow: 'site-migration',
		...props,
	} );

	return renderStep(
		<QueryClientProvider client={ queryClient }>
			<SiteMigrationCapture { ...combinedProps } />
		</QueryClientProvider>,
		{ initialEntry: `/site-migration-capture?${ search ?? '' }` }
	);
};

describe( 'SiteMigrationCapture', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		Object.keys( flowState ).forEach( ( key ) => delete flowState[ key ] );
	} );

	afterEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	afterAll( () => nock.enableNetConnect() );

	describe( 'starting the read', () => {
		it( 'creates a session from the source URL and polls it, with no site involved', async () => {
			const create = mockCreate();
			mockSessionForever( 'capturing' );

			render( { search: `from=${ encodeURIComponent( SOURCE_URL ) }` } );

			await waitFor( () => expect( create.isDone() ).toBe( true ) );
			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Reading your site' } ) ).toBeVisible()
			);
		} );

		it( 'takes the source URL from the identify step when the URL does not carry one', async () => {
			flowState[ 'site-migration-identify' ] = { from: SOURCE_URL };
			const create = mockCreate();
			mockSessionForever( 'capturing' );

			render();

			await waitFor( () => expect( create.isDone() ).toBe( true ) );
		} );

		it( "creates a session even though Stepper's own sessionId is in the URL", async () => {
			// Stepper puts `sessionId` on every step URL as its flow-state key. Reading it
			// as an import session polls a 404 and, being truthy, skips creation entirely.
			const create = mockCreate();
			mockSessionForever( 'capturing' );

			render( { search: `sessionId=xt&from=${ encodeURIComponent( SOURCE_URL ) }` } );

			await waitFor( () => expect( create.isDone() ).toBe( true ) );
		} );

		it( 'resumes an existing session without starting a second read', async () => {
			mockSessionForever( 'capturing' );

			render( {
				search: `importSessionId=${ SESSION_ID }&from=${ encodeURIComponent( SOURCE_URL ) }`,
			} );

			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Reading your site' } ) ).toBeVisible()
			);
			// No create interceptor was registered, so any attempt would throw.
			await settle( 50 );
		} );
	} );

	describe( 'waiting for the read to finish', () => {
		it( 'says which part of the job is running while the user waits', async () => {
			mockSessionForever( 'capturing' );

			render( { search: `importSessionId=${ SESSION_ID }` } );

			await waitFor( () =>
				expect(
					screen.getByText( 'We’re collecting your pages, posts, and images.' )
				).toBeVisible()
			);
		} );

		it( 'says it is building once the pages are collected', async () => {
			mockSessionForever( 'building' );

			render( { search: `importSessionId=${ SESSION_ID }` } );

			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Building your site' } ) ).toBeVisible()
			);
			expect(
				screen.getByText( 'We’re turning your pages into WordPress content.' )
			).toBeVisible();
		} );

		it( 'gives the user no way to skip the wait mid-read', async () => {
			mockSessionForever( 'building' );
			const submit = jest.fn();

			render( { search: `importSessionId=${ SESSION_ID }`, navigation: { submit } } );

			await waitFor( () =>
				expect( screen.getByRole( 'heading', { name: 'Building your site' } ) ).toBeVisible()
			);
			// Review can do nothing without an archive hash, so leaving early would only
			// move the same wait one screen forward.
			expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'moves on by itself once the read is done', async () => {
			mockSessionForever( 'preview_ready', { archive_hash: ARCHIVE_HASH } );
			const submit = jest.fn();

			render( { search: `importSessionId=${ SESSION_ID }`, navigation: { submit } } );

			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( {
					sessionId: SESSION_ID,
					state: 'preview_ready',
				} )
			);
			expect( submit ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'failing before anything has been chosen or paid for', () => {
		it( 'reports a source URL the API will not read', async () => {
			mockCreateFailure( 'invalid_static_site_source_url', 422 );

			render( { search: `from=${ encodeURIComponent( SOURCE_URL ) }` } );

			await waitFor( () =>
				expect(
					screen.getByText(
						'We couldn’t read that address. Check the site is public, then try again.'
					)
				).toBeVisible()
			);
			expect( screen.getByRole( 'heading', { name: 'We couldn’t read your site' } ) ).toBeVisible();
		} );

		it( 'reports the per-user session cap rather than a generic failure', async () => {
			mockCreateFailure( 'static_site_import_session_limit_exceeded', 429 );

			render( { search: `from=${ encodeURIComponent( SOURCE_URL ) }` } );

			await waitFor( () =>
				expect(
					screen.getByText(
						'You already have imports running. Wait for one to finish, or cancel it, then try again.'
					)
				).toBeVisible()
			);
		} );

		it( 'offers a way back to the address when the read fails', async () => {
			mockSessionForever( 'failed' );
			const goBack = jest.fn();

			render( {
				search: `importSessionId=${ SESSION_ID }`,
				navigation: { goBack, submit: jest.fn() },
			} );

			const button = await screen.findByRole( 'button', { name: 'Try a different address' } );
			await userEvent.click( button );

			expect( goBack ).toHaveBeenCalled();
		} );

		it( 'says what it needs when it has neither a session nor an address', () => {
			render();

			expect(
				screen.getByText( 'We need the address of the site you want to move.' )
			).toBeVisible();
		} );
	} );
} );
