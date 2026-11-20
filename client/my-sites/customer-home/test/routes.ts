/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { forwardStudioHomeLink } from 'calypso/my-sites/checkout/studio-return/home-forward';
import { siteSelection } from 'calypso/my-sites/controller';
import { maybeRedirect } from '../controller';
import registerHome from '../index';

jest.mock( '@automattic/calypso-router', () => ( { __esModule: true, default: jest.fn() } ) );
jest.mock( 'calypso/controller', () => ( { makeLayout: jest.fn(), render: jest.fn() } ) );
jest.mock( 'calypso/my-sites/controller', () => ( {
	navigation: jest.fn(),
	siteSelection: jest.fn(),
	sites: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/checkout/studio-return/home-forward', () => ( {
	forwardStudioHomeLink: jest.fn(),
} ) );
jest.mock( '../controller', () => ( {
	__esModule: true,
	default: jest.fn(),
	maybeRedirect: jest.fn(),
	redirectToLandingPage: jest.fn(),
} ) );

describe( '/home/:site route', () => {
	// Every later middleware can redirect a no-guidance site to wp-admin and drop the Studio params.
	it( 'forwards Studio links before selecting the site or redirecting', () => {
		registerHome();

		const route = ( jest.mocked( page ).mock.calls as unknown[][] ).find(
			( [ path ] ) => path === '/home/:site'
		);

		expect( route?.slice( 1, 4 ) ).toEqual( [
			forwardStudioHomeLink,
			siteSelection,
			maybeRedirect,
		] );
	} );
} );
