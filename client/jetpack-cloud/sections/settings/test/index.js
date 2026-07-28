import page from '@automattic/calypso-router';
import { siteSelection } from 'calypso/my-sites/controller';
import settingsRoutes from '..';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn( () => false ),
} ) );

jest.mock( '@automattic/calypso-router', () => jest.fn() );

jest.mock( 'calypso/controller', () => ( {
	makeLayout: jest.fn(),
	render: jest.fn(),
} ) );

jest.mock( 'calypso/jetpack-cloud/sections/settings/controller', () => ( {
	advancedCredentials: jest.fn(),
	disconnectSite: jest.fn(),
	disconnectSiteConfirm: jest.fn(),
	settings: jest.fn(),
	showNotAuthorizedForNonAdmins: jest.fn(),
} ) );

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud', () => jest.fn( () => true ) );

jest.mock( 'calypso/lib/wrap-in-site-offset', () => jest.fn() );

jest.mock( 'calypso/my-sites/controller', () => ( {
	navigation: jest.fn(),
	siteSelection: jest.fn(),
	sites: jest.fn(),
} ) );

describe( 'Jetpack Cloud settings routes', () => {
	beforeEach( () => {
		page.mockClear();
		siteSelection.mockClear();
	} );

	test( 'registers disconnect routes before the generic site settings route', () => {
		settingsRoutes();

		const routePaths = page.mock.calls.map( ( [ path ] ) => path );

		expect( routePaths ).toEqual( [
			'/settings',
			'/settings/disconnect-site/:site',
			'/settings/disconnect-site/confirm/:site',
			'/settings/:site',
		] );
	} );

	test( 'skips normal site selection for confirm routes with an agency site id', () => {
		settingsRoutes();

		const confirmRoute = page.mock.calls.find(
			( [ path ] ) => path === '/settings/disconnect-site/confirm/:site'
		);
		const maybeSiteSelection = confirmRoute[ 2 ];
		const next = jest.fn();

		maybeSiteSelection( { query: { site_id: '12345678' } }, next );

		expect( siteSelection ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'skips normal site selection for disconnected-site troubleshooting routes with an agency site id', () => {
		settingsRoutes();

		const disconnectRoute = page.mock.calls.find(
			( [ path ] ) => path === '/settings/disconnect-site/:site'
		);
		const maybeSiteSelection = disconnectRoute[ 2 ];
		const next = jest.fn();

		maybeSiteSelection( { query: { site_id: '12345678' } }, next );

		expect( siteSelection ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'uses normal site selection for confirm routes without an agency site id', () => {
		settingsRoutes();

		const confirmRoute = page.mock.calls.find(
			( [ path ] ) => path === '/settings/disconnect-site/confirm/:site'
		);
		const maybeSiteSelection = confirmRoute[ 2 ];
		const context = { query: {} };
		const next = jest.fn();

		maybeSiteSelection( context, next );

		expect( siteSelection ).toHaveBeenCalledWith( context, next );
	} );

	test( 'uses normal site selection for confirm routes with an invalid agency site id', () => {
		settingsRoutes();

		const confirmRoute = page.mock.calls.find(
			( [ path ] ) => path === '/settings/disconnect-site/confirm/:site'
		);
		const maybeSiteSelection = confirmRoute[ 2 ];
		const context = { query: { site_id: 'not-a-number' } };
		const next = jest.fn();

		maybeSiteSelection( context, next );

		expect( siteSelection ).toHaveBeenCalledWith( context, next );
	} );
} );
