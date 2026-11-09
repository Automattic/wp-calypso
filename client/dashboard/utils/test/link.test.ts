import config from '@automattic/calypso-config';
import { calypsoLiveRedirectorLink } from '../link';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn();
	return Object.assign( fn, { __esModule: true, default: fn, isEnabled: jest.fn() } );
} );

const IMAGE = 'registry.a8c.com/calypso/app:build-123';

function setConfig( values: Record< string, unknown > ) {
	jest.mocked( config ).mockImplementation( ( key: string ) => values[ key ] as never );
}

describe( 'calypsoLiveRedirectorLink', () => {
	test( 'links to the env the config names for the app', () => {
		setConfig( {
			calypso_live_image: IMAGE,
			calypso_live_envs: { wpcom: 'horizon', dashboard: 'dashboard' },
		} );

		const wpcom = new URL( calypsoLiveRedirectorLink( '/home?foo=bar', 'wpcom' )! );
		expect( wpcom.origin + wpcom.pathname ).toBe( 'https://calypso.live/home' );
		expect( Object.fromEntries( wpcom.searchParams ) ).toEqual( {
			foo: 'bar',
			image: IMAGE,
			env: 'horizon',
		} );

		const dashboard = new URL( calypsoLiveRedirectorLink( '/sites', 'dashboard' )! );
		expect( dashboard.searchParams.get( 'env' ) ).toBe( 'dashboard' );
	} );

	test( 'returns null without an image', () => {
		setConfig( {
			calypso_live_image: false,
			calypso_live_envs: { wpcom: 'calypso', dashboard: 'dashboard' },
		} );
		expect( calypsoLiveRedirectorLink( '/home', 'wpcom' ) ).toBeNull();
	} );

	test( 'returns null when the config names no env for the app', () => {
		setConfig( { calypso_live_image: IMAGE, calypso_live_envs: { dashboard: 'dashboard' } } );
		expect( calypsoLiveRedirectorLink( '/home', 'wpcom' ) ).toBeNull();

		setConfig( { calypso_live_image: IMAGE, calypso_live_envs: false } );
		expect( calypsoLiveRedirectorLink( '/sites', 'dashboard' ) ).toBeNull();
	} );

	test( 'returns null for an absolute URL', () => {
		setConfig( {
			calypso_live_image: IMAGE,
			calypso_live_envs: { wpcom: 'calypso', dashboard: 'dashboard' },
		} );
		expect( calypsoLiveRedirectorLink( 'https://example.com/home', 'wpcom' ) ).toBeNull();
	} );
} );
