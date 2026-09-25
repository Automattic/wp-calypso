/**
 * @jest-environment jsdom
 */
import { bigSkyPluginQuery, queryClient } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
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
	beforeEach( () => {
		queryClient.clear();
		mockedIsEnabled.mockReturnValue( false );
	} );

	it( 'keeps the dashboard plugin management page disabled', () => {
		expect( getAgentsManagerEligibility( '/plugins', true ).routeIsEnabled ).toBe( false );
	} );

	it( 'waits for the selected site setting before loading the marketplace agent', async () => {
		const siteId = 123;
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ siteId }/big-sky-plugin` )
			.reply( 200, { enabled: true } );
		const { result } = renderHook( () =>
			useShouldLoadAgentsManager( '/plugins', siteId, 'plugins' )
		);

		expect( result.current.routeIsEnabled ).toBe( false );
		await waitFor( () => expect( result.current.routeIsEnabled ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
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
	] )( 'loads %s with WordPress Agent enabled on the selected site', ( route ) => {
		const siteId = 123;
		queryClient.setQueryData( bigSkyPluginQuery( siteId ).queryKey, { enabled: true } );
		const { result } = renderHook( () => useShouldLoadAgentsManager( route, siteId, 'plugins' ) );
		expect( result.current ).toEqual( { routeIsEnabled: true, isInternalOnly: false } );
	} );
	it( 'does not load without a selected site, even with cached plugin status', () => {
		queryClient.setQueryData( bigSkyPluginQuery( 0 ).queryKey, { enabled: true } );
		const { result } = renderHook( () =>
			useShouldLoadAgentsManager( '/plugins', null, 'plugins' )
		);
		expect( result.current.routeIsEnabled ).toBe( false );
	} );

	it( 'does not load when WordPress Agent is disabled on the selected site', () => {
		const siteId = 123;
		queryClient.setQueryData( bigSkyPluginQuery( siteId ).queryKey, { enabled: false } );
		const { result } = renderHook( () =>
			useShouldLoadAgentsManager( '/plugins', siteId, 'plugins' )
		);
		expect( result.current.routeIsEnabled ).toBe( false );
		expect( getAgentsManagerEligibility( '/plugins', false, 'plugins' ).routeIsEnabled ).toBe(
			false
		);
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
				getAgentsManagerEligibility( `/plugins/${ route }${ suffix }`, true, 'plugins' )
					.routeIsEnabled
			).toBe( false );
		}
	} );
} );
