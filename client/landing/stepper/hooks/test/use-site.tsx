/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useDispatch } from 'calypso/state';
import { useFlowState } from '../../declarative-flow/internals/state-manager/store';
import { useSite } from '../use-site';
import { useSiteIdParam } from '../use-site-id-param';
import { useSiteResolution } from '../use-site-resolution';
import { useSiteSlugParam } from '../use-site-slug-param';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSite: jest.fn(),
	isRequestingSite: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	SITE_STORE: 'site-store',
} ) );

jest.mock( '../../declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn(),
} ) );

jest.mock( '../use-site-id-param', () => ( {
	useSiteIdParam: jest.fn(),
} ) );

jest.mock( '../use-site-slug-param', () => ( {
	useSiteSlugParam: jest.fn(),
} ) );

const siteStore = {
	getSite: jest.fn(),
	hasFinishedResolution: jest.fn(),
};

describe( 'site resolution', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( useDispatch as jest.Mock ).mockReturnValue( jest.fn() );
		( useFlowState as jest.Mock ).mockReturnValue( {
			get: jest.fn().mockReturnValue( null ),
		} );
		( useSiteIdParam as jest.Mock ).mockReturnValue( null );
		( useSiteSlugParam as jest.Mock ).mockReturnValue( null );
		( useSelect as jest.Mock ).mockImplementation( ( mapSelect ) => mapSelect( () => siteStore ) );
	} );

	it( 'reports an unresolved site lookup as unfinished', () => {
		siteStore.getSite.mockReturnValue( undefined );
		siteStore.hasFinishedResolution.mockReturnValue( false );

		const { result } = renderHook( () => ( {
			site: useSite( 'example.wordpress.com' ),
			hasSiteResolutionFinished: useSiteResolution( 'example.wordpress.com' ),
		} ) );

		expect( result.current ).toEqual( {
			site: null,
			hasSiteResolutionFinished: false,
		} );
	} );

	it( 'returns the site after a successful resolution', () => {
		const site = {
			ID: 123,
			URL: 'https://example.wordpress.com',
		} as SiteDetails;
		siteStore.getSite.mockReturnValue( site );
		siteStore.hasFinishedResolution.mockReturnValue( true );

		const { result } = renderHook( () => ( {
			site: useSite( 123 ),
			hasSiteResolutionFinished: useSiteResolution( 123 ),
		} ) );

		expect( result.current ).toEqual( {
			site,
			hasSiteResolutionFinished: true,
		} );
	} );

	it( 'reports a failed resolution as finished without a site', () => {
		siteStore.getSite.mockReturnValue( undefined );
		siteStore.hasFinishedResolution.mockReturnValue( true );

		const { result } = renderHook( () => ( {
			site: useSite( 'missing.wordpress.com' ),
			hasSiteResolutionFinished: useSiteResolution( 'missing.wordpress.com' ),
		} ) );

		expect( result.current ).toEqual( {
			site: null,
			hasSiteResolutionFinished: true,
		} );
	} );

	it( 'preserves the original site identifier as the resolver cache key', () => {
		siteStore.getSite.mockReturnValue( undefined );
		siteStore.hasFinishedResolution.mockReturnValue( false );

		renderHook( () => {
			useSite( '00123' );
			return useSiteResolution( '00123' );
		} );

		expect( siteStore.getSite ).toHaveBeenCalledWith( '00123' );
		expect( siteStore.hasFinishedResolution ).toHaveBeenCalledWith( 'getSite', [ '00123' ] );
	} );

	it( 'treats a route without a site identifier as resolved', () => {
		const { result } = renderHook( () => ( {
			site: useSite(),
			hasSiteResolutionFinished: useSiteResolution(),
		} ) );

		expect( result.current ).toEqual( {
			site: null,
			hasSiteResolutionFinished: true,
		} );
		expect( siteStore.getSite ).not.toHaveBeenCalled();
		expect( siteStore.hasFinishedResolution ).not.toHaveBeenCalled();
	} );

	it( 'keeps the existing useSite return value', () => {
		const site = {
			ID: 123,
			URL: 'https://example.wordpress.com',
		} as SiteDetails;
		siteStore.getSite.mockReturnValue( site );
		siteStore.hasFinishedResolution.mockReturnValue( true );

		const { result } = renderHook( () => useSite( 123 ) );

		expect( result.current ).toBe( site );
	} );
} );
