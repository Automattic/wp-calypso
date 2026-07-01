import { disconnectSite, disconnectSiteConfirm } from '../controller';

jest.mock( 'calypso/my-sites/site-settings/disconnect-site/confirm', () => () => null );
jest.mock( 'calypso/my-sites/site-settings/disconnect-site', () => () => null );

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( () => null );
	config.isEnabled = jest.fn( () => false );
	return config;
} );

jest.mock( 'calypso/lib/jetpack/paths', () => ( {
	dashboardPath: jest.fn( () => '/dashboard' ),
} ) );

describe( 'Jetpack Cloud settings controller', () => {
	test( 'allows agency disconnect confirmation routes to bypass non-Jetpack redirects', () => {
		const context = {
			params: {
				site: 'wildfowl-of-salmons.jurassic.ninja',
			},
			query: {
				site_id: '254548256',
				site_url: 'wildfowl-of-salmons.jurassic.ninja',
				type: 'down',
			},
		};
		const next = jest.fn();

		disconnectSiteConfirm( context, next );

		expect( context.primary.props.backHref ).toBe(
			'/settings/disconnect-site/wildfowl-of-salmons.jurassic.ninja?site_id=254548256&site_url=wildfowl-of-salmons.jurassic.ninja&type=down'
		);
		expect( context.primary.props.skipRedirectNonJetpack ).toBe( true );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'passes agency site context to disconnected-site troubleshooting routes', () => {
		const context = {
			params: {
				site: 'wildfowl-of-salmons.jurassic.ninja',
			},
			query: {
				site_id: '254548256',
				site_url: 'wildfowl-of-salmons.jurassic.ninja',
				type: 'down',
			},
		};
		const next = jest.fn();

		disconnectSite( context, next );

		expect( context.primary.props.siteId ).toBe( 254548256 );
		expect( context.primary.props.siteSlug ).toBe( 'wildfowl-of-salmons.jurassic.ninja' );
		expect( context.primary.props.siteTitle ).toBe( 'wildfowl-of-salmons.jurassic.ninja' );
		expect( context.primary.props.skipRedirectNonJetpack ).toBe( true );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );
} );
