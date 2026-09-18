/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import StaticSiteImportReading from '..';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { StaticSiteImportSession } from '@automattic/api-core';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const session = (
	state: StaticSiteImportSession[ 'state' ],
	extra: Partial< StaticSiteImportSession > = {}
): StaticSiteImportSession => ( {
	session_id: 'abc123',
	status: 'new',
	state,
	source_digest: 'digest',
	preview_summary: [],
	site_url: '',
	...extra,
} );

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

	it( 'starts a session for the HTTPS source URL and hands its id to the flow', async () => {
		let postedBody: Record< string, unknown > = {};
		mockApi()
			.post( '/wpcom/v2/static-site-import-session', ( body ) => {
				postedBody = body;
				return true;
			} )
			.query( true )
			.reply( 200, session( 'capture_queued' ) );

		const submit = render( '/static-site-import-reading?from=busybearscleaning.com&platform=wix' );

		expect( await screen.findByText( 'Reading your site' ) ).toBeVisible();
		expect(
			screen.getByText( 'This can take a few minutes. Your Wix site stays live and unchanged.' )
		).toBeVisible();

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( {
				action: 'session-created',
				importSessionId: 'abc123',
			} )
		);
		expect( postedBody ).toEqual( { source_url: 'https://busybearscleaning.com' } );
	} );

	it( 'resumes the session in the URL without starting another one', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, session( 'preview_ready' ) );

		const submit = render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123'
		);

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( { action: 'continue', importSessionId: 'abc123' } )
		);
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'reports the flow as unavailable when the API refuses the session', async () => {
		mockApi().post( '/wpcom/v2/static-site-import-session' ).query( true ).reply( 404, {
			code: 'static_site_import_disabled',
			message: 'Static site import is not enabled.',
		} );

		const submit = render( '/static-site-import-reading?from=busybearscleaning.com' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
	} );

	it( 'reports a failed capture', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply(
				200,
				session( 'failed', {
					receipt: { success: false, code: 'static_site_capture_capture_failed' },
				} )
			);

		const submit = render(
			'/static-site-import-reading?from=busybearscleaning.com&importSessionId=abc123'
		);

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
	} );
} );
