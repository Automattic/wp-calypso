import { disconnectSiteConfirm } from '../controller';

jest.mock( 'calypso/my-sites/site-settings/disconnect-site/confirm', () => () => null );

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

		expect( context.primary.props.skipRedirectNonJetpack ).toBe( true );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );
} );
