/**
 * @jest-environment jsdom
 */
import { bigSkyPluginQuery, queryClient } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import useShouldLoadAgentsManager, {
	getAgentsManagerEligibility,
} from '../use-should-load-agents-manager';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

const mockedIsEnabled = jest.mocked( isEnabled );

describe( 'useShouldLoadAgentsManager', () => {
	beforeEach( () => {
		queryClient.clear();
		mockedIsEnabled.mockReturnValue( true );
	} );

	it.each( [ '/sites/example.wordpress.com', '/sites/example.com/' ] )(
		'loads Agents Manager on a site overview at %s',
		( currentRoute ) => {
			expect( getAgentsManagerEligibility( currentRoute, true ) ).toEqual( {
				routeIsEnabled: true,
				isInternalOnly: true,
			} );
		}
	);

	it.each( [ '/sites', '/sites/example.com/domains', '/me', '/', null, undefined ] )(
		'does not load Agents Manager at %s',
		( currentRoute ) => {
			expect( getAgentsManagerEligibility( currentRoute, true ) ).toEqual( {
				routeIsEnabled: false,
				isInternalOnly: false,
			} );
		}
	);

	it( 'does not load Agents Manager when WordPress Agent is disabled', () => {
		expect( getAgentsManagerEligibility( '/sites/example.com', false ) ).toEqual( {
			routeIsEnabled: false,
			isInternalOnly: true,
		} );
	} );

	it.each( [ true, false ] )(
		'returns %s when the WordPress Agent setting has that value',
		( enabled ) => {
			const siteId = 123;
			queryClient.setQueryData( bigSkyPluginQuery( siteId ).queryKey, {
				blog_id: siteId,
				enabled,
				available: true,
				on_free_trial: false,
			} );

			const { result } = renderHook( () =>
				useShouldLoadAgentsManager( '/sites/example.com', siteId )
			);

			expect( result.current ).toEqual( {
				routeIsEnabled: enabled,
				isInternalOnly: true,
			} );
		}
	);

	it( 'does not load an internal-only route when the internal feature is disabled', () => {
		mockedIsEnabled.mockReturnValue( false );

		expect( getAgentsManagerEligibility( '/sites/example.com', true ) ).toEqual( {
			routeIsEnabled: false,
			isInternalOnly: true,
		} );
		expect( mockedIsEnabled ).toHaveBeenCalledWith( 'calypso/agents-manager-internal' );
	} );
} );

describe( 'marketplace eligibility', () => {
	it( 'keeps the dashboard plugin management page disabled', () => {
		expect( getAgentsManagerEligibility( '/plugins', true ).routeIsEnabled ).toBe( false );
	} );
	it.each( [
		'/plugins',
		'/plugins/',
		'/plugins/example.com',
		'/plugins/wordpress-seo',
		'/plugins/wordpress-seo/example.com',
		'/plugins/browse/seo',
		'/plugins/browse/seo/example.com',
		'/plugins?search=seo',
	] )( 'loads %s without Big Sky or a selected site', ( route ) => {
		mockedIsEnabled.mockReturnValue( false );
		const { result } = renderHook( () => useShouldLoadAgentsManager( route, null, true ) );
		expect( result.current ).toEqual( { routeIsEnabled: true, isInternalOnly: false } );
	} );
	it.each( [
		'manage',
		'upload',
		'setup',
		'scheduled-updates',
		'active',
		'inactive',
		'updates',
		'plans',
	] )( 'excludes %s routes', ( route ) => {
		for ( const suffix of [ '', '/example.com', '/edit/123' ] ) {
			expect(
				getAgentsManagerEligibility( `/plugins/${ route }${ suffix }`, true, true ).routeIsEnabled
			).toBe( false );
		}
	} );
} );
