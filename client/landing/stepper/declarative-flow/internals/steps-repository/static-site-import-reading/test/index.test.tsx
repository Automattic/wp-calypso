/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { MemoryRouter } from 'react-router';
import {
	clearSignupDestinationCookie,
	persistSignupDestination,
	retrieveSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StaticSiteImportReading from '..';
import { mockStepProps } from '../../test/helpers';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { siteSlug: 'destination.example.com' } ),
} ) );

const render = ( initialEntry: string, afterCheckout = true ) => {
	initialEntry = `/setup${ initialEntry }&siteId=123`;
	if ( afterCheckout ) {
		persistSignupDestination( initialEntry );
	}
	const submit = jest.fn();
	renderWithProvider(
		<MemoryRouter basename="/setup" initialEntries={ [ initialEntry ] }>
			<StaticSiteImportReading
				{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-reading' } ) }
			/>
		</MemoryRouter>,
		{ reducers: { documentHead: documentHeadReducer, ui: uiReducer } }
	);
	return submit;
};

describe( 'StaticSiteImportReading', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		nock.cleanAll();
		clearSignupDestinationCookie();
		setSignupCompleteFlowName( 'static-site-import' );
	} );

	it.each( [ '', '&applySiteSettings=1' ] )(
		'waits for confirmation on an existing destination (%s)',
		async ( settingsQuery ) => {
			const createSession = mockApi()
				.post( '/wpcom/v2/static-site-import-session' )
				.query( true )
				.reply( 200, { session_id: 'abc123', state: 'capture_queued' } );
			const settings = mockApi().post( '/rest/v1.4/sites/123/settings' ).reply( 200 );
			const intent = mockApi().post( '/wpcom/v2/sites/123/site-intent' ).reply( 200 );
			const submit = render(
				`/static-site-import-reading?from=busybearscleaning.com${ settingsQuery }`,
				false
			);

			expect(
				screen.getByRole( 'heading', { name: 'Import into destination.example.com?' } )
			).toBeVisible();
			expect( createSession.isDone() ).toBe( false );
			expect( submit ).not.toHaveBeenCalled();

			await userEvent.click( screen.getByRole( 'button', { name: 'Import into this site' } ) );

			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } )
			);
			expect( createSession.isDone() ).toBe( true );
			expect( settings.isDone() ).toBe( false );
			expect( intent.isDone() ).toBe( false );
		}
	);

	it( 'requires confirmation before resuming a session from a direct link', async () => {
		const submit = render( '/static-site-import-reading?importSessionId=abc123', false );

		expect( submit ).not.toHaveBeenCalled();
		await userEvent.click( screen.getByRole( 'button', { name: 'Import into this site' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } );
	} );

	it.each( [
		'siteId=456&from=busybearscleaning.com',
		'siteId=123&from=another.example.com',
		'siteId=:siteId&from=busybearscleaning.com',
		'siteId=123&from=busybearscleaning.com&importSessionId=another-session',
	] )(
		'does not accept a checkout return for a different destination or source (%s)',
		( query ) => {
			persistSignupDestination(
				`/setup/static-site-import-reading?${ query }&applySiteSettings=1`
			);
			const submit = render(
				'/static-site-import-reading?from=busybearscleaning.com&applySiteSettings=1',
				false
			);

			expect( screen.getByRole( 'button', { name: 'Import into this site' } ) ).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		}
	);

	it( 'starts a session for the HTTPS source URL and moves on without waiting for the capture', async () => {
		let postedBody: Record< string, unknown > = {};
		mockApi()
			.post( '/wpcom/v2/static-site-import-session', ( body ) => {
				postedBody = body;
				return true;
			} )
			.query( true )
			.reply( 200, { session_id: 'abc123', state: 'capture_queued' } );

		const submit = render( '/static-site-import-reading?from=busybearscleaning.com&platform=wix' );

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } )
		);
		expect( postedBody ).toEqual( { source_url: 'https://busybearscleaning.com' } );
		expect( retrieveSignupDestination() ).toBeUndefined();
	} );

	it.each( [ undefined, 'abc123' ] )(
		'applies site settings before continuing session %s',
		async ( sessionId ) => {
			const expectedSettings = {
				blogname: 'My Site',
				blog_public: 0,
				wpcom_public_coming_soon: 1,
			};
			mockApi()
				.post( '/rest/v1.4/sites/123/settings', expectedSettings )
				.reply( 200, { updated: expectedSettings } );
			mockApi()
				.post( '/wpcom/v2/sites/123/site-intent', { site_intent: 'site-migration' } )
				.reply( 200, {} );
			if ( ! sessionId ) {
				mockApi()
					.post( '/wpcom/v2/static-site-import-session', {
						source_url: 'https://busybearscleaning.com',
					} )
					.query( true )
					.reply( 200, { session_id: 'abc123', state: 'capture_queued' } );
			}

			const submit = render(
				`/static-site-import-reading?applySiteSettings=1&from=busybearscleaning.com${ sessionId ? `&importSessionId=${ sessionId }` : '' }`
			);

			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } )
			);
			expect( nock.pendingMocks() ).toHaveLength( 0 );
		}
	);

	it.each( [ '', '&importSessionId=abc123' ] )(
		'does not continue when applying site settings fails (%s)',
		async ( sessionQuery ) => {
			mockApi().post( '/rest/v1.4/sites/123/settings' ).reply( 500 );
			mockApi().post( '/wpcom/v2/sites/123/site-intent' ).reply( 200, {} );
			const sessionRequest = mockApi()
				.post( '/wpcom/v2/static-site-import-session' )
				.query( true )
				.reply( 200, { session_id: 'abc123', state: 'capture_queued' } );

			const submit = render(
				`/static-site-import-reading?applySiteSettings=1&from=busybearscleaning.com${ sessionQuery }`
			);

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
			expect( sessionRequest.isDone() ).toBe( false );
			expect( retrieveSignupDestination() ).toBeDefined();
		}
	);

	it( 'resumes the session in the URL without starting another one', () => {
		const submit = render( '/static-site-import-reading?importSessionId=abc123' );

		expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } );
		expect( nock.pendingMocks() ).toHaveLength( 0 );
	} );

	it( 'reports the flow as unavailable when the API can’t start a session', async () => {
		mockApi().post( '/wpcom/v2/static-site-import-session' ).query( true ).reply( 404, {
			code: 'static_site_import_disabled',
			message: 'Static site import is not enabled.',
		} );

		const submit = render( '/static-site-import-reading?from=busybearscleaning.com' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
	} );

	it( 'stops at a refused source instead of offering another route', async () => {
		mockApi().post( '/wpcom/v2/static-site-import-session' ).query( true ).reply( 403, {
			code: 'static_site_import_source_refused',
			message: 'This site cannot be imported.',
		} );

		const submit = render( '/static-site-import-reading?from=busybearscleaning.com' );

		expect( await screen.findByText( 'We can’t import this site' ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );
} );
