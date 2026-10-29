/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { MemoryRouter } from 'react-router';
import { recordSignupComplete } from 'calypso/lib/analytics/signup';
import {
	clearSignupDestinationCookie,
	persistSignupDestination,
	retrieveSignupDestination,
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
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( {
		siteSlug: 'destination.example.com',
		site: { plan: { product_slug: 'business-bundle' } },
	} ),
} ) );

const render = ( query: string, { afterCheckout = true, siteId = '123' } = {} ) => {
	const url = `/setup/static-site-import-reading?${ query }&siteId=${ siteId }`;
	if ( afterCheckout ) {
		persistSignupDestination( url );
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
		clearSignupDestinationCookie();
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

	it.each( [
		'siteId=456&from=busybearscleaning.com',
		'siteId=123&from=another.example.com',
		'siteId=123&from=busybearscleaning.com&importSessionId=another-session',
	] )( 'does not treat a return for another destination or source as this one (%s)', ( query ) => {
		persistSignupDestination( `/setup/static-site-import-reading?${ query }&newSite=1` );
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
		expect( retrieveSignupDestination() ).toBeUndefined();
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

	it( 'does not continue when applying site settings fails', async () => {
		mockApi().post( '/rest/v1.4/sites/123/settings' ).reply( 500 );
		mockApi().post( '/wpcom/v2/sites/123/site-intent' ).reply( 200, {} );
		const sessionRequest = mockApi()
			.post( '/wpcom/v2/static-site-import-session' )
			.query( true )
			.reply( 200, sessionResponse );

		const submit = render( 'newSite=1&from=busybearscleaning.com&importSessionId=abc123' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
		expect( sessionRequest.isDone() ).toBe( false );
		expect( retrieveSignupDestination() ).toBeDefined();
	} );

	it( 'reports the flow as unavailable when the API can’t start a session', async () => {
		mockApi().post( '/wpcom/v2/static-site-import-session' ).query( true ).reply( 404, {
			code: 'static_site_import_disabled',
			message: 'Static site import is not enabled.',
		} );

		const submit = render( 'from=busybearscleaning.com' );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } ) );
	} );

	it( 'stops at a refused source instead of offering another route', async () => {
		mockApi().post( '/wpcom/v2/static-site-import-session' ).query( true ).reply( 403, {
			code: 'static_site_import_source_refused',
			message: 'This site cannot be imported.',
		} );

		const submit = render( 'from=busybearscleaning.com' );

		expect( await screen.findByText( 'We can’t import this site' ) ).toBeVisible();
		expect( submit ).not.toHaveBeenCalled();
	} );
} );
