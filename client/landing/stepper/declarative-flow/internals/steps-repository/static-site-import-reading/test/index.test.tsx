/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import StaticSiteImportReading from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = ( initialEntry: string ) => {
	const submit = jest.fn();
	renderStep(
		<StaticSiteImportReading
			{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-reading' } ) }
		/>,
		{ initialEntry }
	);
	return submit;
};

describe( 'StaticSiteImportReading', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		nock.cleanAll();
	} );

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
	} );

	it( 'applies checkout site settings before starting the session for a new destination', async () => {
		const expectedSettings = {
			blogname: 'My Site',
			blog_public: 0,
			wpcom_public_coming_soon: 1,
			site_creation_flow: 'static-site-import',
		};
		mockApi()
			.post( '/rest/v1.4/sites/123/settings', expectedSettings )
			.reply( 200, { updated: expectedSettings } );
		mockApi()
			.post( '/wpcom/v2/sites/123/site-intent', { site_intent: 'site-migration' } )
			.reply( 200, {} );
		mockApi()
			.post( '/wpcom/v2/static-site-import-session', {
				source_url: 'https://busybearscleaning.com',
			} )
			.query( true )
			.reply( 200, { session_id: 'abc123', state: 'capture_queued' } );

		const submit = render(
			'/static-site-import-reading?applySiteSettings=1&siteId=123&from=busybearscleaning.com'
		);

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } )
		);
		expect( nock.pendingMocks() ).toHaveLength( 0 );
	} );

	it( 'does not start the import when applying the site settings fails', async () => {
		mockApi().post( '/rest/v1.4/sites/123/settings' ).reply( 500 );
		mockApi().post( '/wpcom/v2/sites/123/site-intent' ).reply( 200, {} );
		const sessionRequest = mockApi()
			.post( '/wpcom/v2/static-site-import-session' )
			.query( true )
			.reply( 200, { session_id: 'abc123', state: 'capture_queued' } );

		const submit = render(
			'/static-site-import-reading?applySiteSettings=1&siteId=123&from=busybearscleaning.com'
		);

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
		expect( sessionRequest.isDone() ).toBe( false );
	} );

	it( 'resumes the session in the URL without starting another one', () => {
		const submit = render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123'
		);

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
