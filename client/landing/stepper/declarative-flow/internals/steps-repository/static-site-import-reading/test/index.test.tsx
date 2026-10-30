/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { MemoryRouter } from 'react-router';
import { startWowFunnelSite } from 'calypso/landing/stepper/utils/wow-funnel-site';
import { recordSignupComplete } from 'calypso/lib/analytics/signup';
import {
	getSignupCompleteFlowName,
	setSignupCompleteFlowName,
	setSignupIsNewUser,
} from 'calypso/signup/storageUtils';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StaticSiteImportReading from '..';
import { mockStepProps } from '../../test/helpers';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );
const sessionResponse = { session_id: 'abc123', state: 'capture_queued' };
const continueWithSession = { action: 'continue', importSessionId: 'abc123' };

jest.mock( 'calypso/lib/analytics/signup', () => ( {
	...jest.requireActual( 'calypso/lib/analytics/signup' ),
	recordSignupComplete: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/utils/wow-funnel-site', () => ( {
	startWowFunnelSite: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( {
		siteSlug: 'destination.example.com',
		site: { plan: { product_slug: 'business-bundle' } },
	} ),
} ) );

const render = ( query: string, { afterCheckout = true, siteId = '123' } = {} ) => {
	const url = `/setup/static-site-import-reading?${ query }${ siteId ? `&siteId=${ siteId }` : '' }`;
	if ( afterCheckout ) {
		setSignupCompleteFlowName( 'static-site-import' );
	}
	const submit = jest.fn();
	renderWithProvider(
		<MemoryRouter basename="/setup" initialEntries={ [ url ] }>
			<StaticSiteImportReading
				{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-reading' } ) }
			/>
		</MemoryRouter>,
		{
			reducers: { documentHead: documentHeadReducer, ui: uiReducer },
			initialState: { currentUser: { id: 7 } },
		}
	);
	return submit;
};

describe( 'StaticSiteImportReading', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		nock.cleanAll();
		jest.clearAllMocks();
		window.localStorage.clear();
		window.sessionStorage.clear();
	} );

	it.each( [
		'from=busybearscleaning.com',
		'from=busybearscleaning.com&newSite=1',
		'importSessionId=abc123',
	] )(
		'waits for confirmation on a destination the user did not just buy for (%s)',
		async ( query ) => {
			const createSession = mockApi()
				.post( '/wpcom/v2/static-site-import-session' )
				.query( true )
				.reply( 200, sessionResponse );
			const submit = render( query, { afterCheckout: false } );

			expect(
				screen.getByRole( 'heading', { name: 'Import into destination.example.com?' } )
			).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();

			await userEvent.click( screen.getByRole( 'button', { name: 'Import into this site' } ) );

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( continueWithSession ) );
			expect( createSession.isDone() ).toBe( ! query.includes( 'importSessionId' ) );
			expect( recordSignupComplete ).not.toHaveBeenCalled();
		}
	);

	it( 'does not treat a checkout from another flow as this one', () => {
		setSignupCompleteFlowName( 'onboarding' );
		const submit = render( 'from=busybearscleaning.com&newSite=1', { afterCheckout: false } );

		expect( screen.getByRole( 'button', { name: 'Import into this site' } ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'starts a session for the HTTPS source URL after checkout for an existing site', async () => {
		let postedBody: Record< string, unknown > = {};
		mockApi()
			.post( '/wpcom/v2/static-site-import-session', ( body ) => {
				postedBody = body;
				return true;
			} )
			.query( true )
			.reply( 200, sessionResponse );

		const submit = render( 'from=busybearscleaning.com&platform=wix' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( continueWithSession ) );
		expect( postedBody ).toEqual( { source_url: 'https://busybearscleaning.com' } );
		expect( getSignupCompleteFlowName() ).toBeNull();
		expect( recordSignupComplete ).not.toHaveBeenCalled();
	} );

	it( 'records the signup and applies the flow’s site settings to a site checkout created', async () => {
		setSignupIsNewUser( 7 );
		const expectedSettings = { blogname: 'My Site', blog_public: 0, wpcom_public_coming_soon: 1 };
		mockApi().post( '/rest/v1.4/sites/123/settings', expectedSettings ).reply( 200, {} );
		mockApi()
			.post( '/wpcom/v2/sites/123/site-intent', { site_intent: 'site-migration' } )
			.reply( 200, {} );
		mockApi()
			.post( '/wpcom/v2/static-site-import-session' )
			.query( true )
			.reply( 200, sessionResponse );

		const submit = render( 'newSite=1&from=busybearscleaning.com' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( continueWithSession ) );
		expect( nock.pendingMocks() ).toHaveLength( 0 );
		expect( recordSignupComplete ).toHaveBeenCalledWith(
			expect.objectContaining( {
				flow: 'static-site-import',
				siteId: 123,
				isNewUser: true,
				planProductSlug: 'business-bundle',
			} ),
			true
		);
	} );

	it( 'records the signup only once for a site checkout created', async () => {
		mockApi().post( '/rest/v1.4/sites/123/settings' ).reply( 200, {} );
		mockApi().post( '/wpcom/v2/sites/123/site-intent' ).reply( 200, {} );

		const submit = render( 'newSite=1&importSessionId=abc123' );
		await waitFor( () => expect( submit ).toHaveBeenCalledWith( continueWithSession ) );
		render( 'newSite=1&importSessionId=abc123', { afterCheckout: false } );

		expect( screen.getByRole( 'button', { name: 'Import into this site' } ) ).toBeVisible();
		expect( recordSignupComplete ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'continues the import when applying site settings fails', async () => {
		mockApi().post( '/rest/v1.4/sites/123/settings' ).reply( 500 );
		mockApi().post( '/wpcom/v2/sites/123/site-intent' ).reply( 500 );

		const submit = render( 'newSite=1&from=busybearscleaning.com&importSessionId=abc123' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( continueWithSession ) );
		expect( getSignupCompleteFlowName() ).toBeNull();
	} );

	it( 'reports the flow as unavailable when the API can’t start a session', async () => {
		mockApi().post( '/wpcom/v2/static-site-import-session' ).query( true ).reply( 404, {
			code: 'static_site_import_disabled',
			message: 'Static site import is not enabled.',
		} );

		const submit = render( 'from=busybearscleaning.com' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
	} );

	describe( 'preview', () => {
		beforeEach( () => config.enable( 'migration/static-site-preview' ) );
		afterEach( () => config.disable( 'migration/static-site-preview' ) );

		it.each( [
			{
				name: 'builds a preview site for the session and continues to it',
				preview: () =>
					Promise.resolve( {
						funnelSlug: 'preview',
						funnelKey: 'preview',
						blogId: 456,
						siteSlug: 'preview.wpcomstaging.com',
					} ),
				expected: { ...continueWithSession, previewSiteSlug: 'preview.wpcomstaging.com' },
			},
			{
				name: 'reports a preview the server would not build',
				preview: (): Promise< never > =>
					Promise.reject( new Error( 'Preview sites are not open yet.' ) ),
				expected: { action: 'preview_failed', message: 'Preview sites are not open yet.' },
			},
		] )( '$name', async ( { preview, expected } ) => {
			jest.mocked( startWowFunnelSite ).mockImplementation( preview );
			mockApi()
				.post( '/wpcom/v2/static-site-import-session' )
				.query( true )
				.reply( 200, sessionResponse );

			const submit = render( 'from=busybearscleaning.com', { afterCheckout: false, siteId: '' } );

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( expected ) );
			expect( startWowFunnelSite ).toHaveBeenCalledWith( {
				funnelSlug: 'preview',
				funnelArgs: { import_session_id: 'abc123' },
			} );
			expect( screen.queryByText( 'Import into this site' ) ).not.toBeInTheDocument();
		} );

		it( 'imports into a destination the URL names, not a preview', () => {
			render( 'from=busybearscleaning.com', { afterCheckout: false } );

			expect( screen.getByRole( 'button', { name: 'Import into this site' } ) ).toBeVisible();
			expect( startWowFunnelSite ).not.toHaveBeenCalled();
		} );
	} );

	it( 'stops at a refused source instead of offering another route', async () => {
		mockApi().post( '/wpcom/v2/static-site-import-session' ).query( true ).reply( 403, {
			code: 'static_site_import_source_refused',
			message: 'This site cannot be imported.',
		} );

		const submit = render( 'from=busybearscleaning.com' );

		expect( await screen.findByText( 'We can’t import this site' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Get help' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Go to your site' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/sites/destination.example.com' )
		);
		expect( submit ).not.toHaveBeenCalled();
	} );
} );
