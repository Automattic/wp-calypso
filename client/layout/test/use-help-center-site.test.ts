/**
 * @jest-environment jsdom
 */

import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import getSite from 'calypso/state/sites/selectors/get-site';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useHelpCenterSite } from '../use-help-center-site';

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/get-primary-site-slug', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteBySlug: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/selectors/get-site', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const mockGetSelectedSite = getSelectedSite as unknown as jest.Mock;
const mockGetPrimarySiteSlug = getPrimarySiteSlug as unknown as jest.Mock;
const mockGetSiteBySlug = getSiteBySlug as unknown as jest.Mock;
const mockGetSite = getSite as unknown as jest.Mock;

const selectedSite = { ID: 1 };
const urlParamSite = { ID: 2 };
const primarySite = { ID: 3 };

describe( 'useHelpCenterSite', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.history.replaceState( {}, '', '/' );
		mockGetSelectedSite.mockReturnValue( null );
		mockGetPrimarySiteSlug.mockReturnValue( null );
		mockGetSiteBySlug.mockReturnValue( null );
		mockGetSite.mockReturnValue( null );
	} );

	it( 'prefers selected site', () => {
		mockGetSelectedSite.mockReturnValue( selectedSite );
		mockGetPrimarySiteSlug.mockReturnValue( 'primary-site' );
		mockGetSiteBySlug.mockReturnValue( primarySite );

		const { result } = renderHookWithProvider( () => useHelpCenterSite() );

		expect( result.current.site ).toBe( selectedSite );
		expect( result.current.siteContextSource ).toBe( 'calypso_selected_site' );
	} );

	it( 'keeps a previously selected site on general-admin routes, before the primary site', () => {
		// Redux's selectedSiteId is sticky: /me, /read and /help don't clear it,
		// so a session that visited a site attributes that site there — matching
		// the site the Help Center panel actually mounts with.
		window.history.replaceState( {}, '', '/me' );
		mockGetSelectedSite.mockReturnValue( selectedSite );
		mockGetPrimarySiteSlug.mockReturnValue( 'primary-site' );
		mockGetSiteBySlug.mockReturnValue( primarySite );

		const { result } = renderHookWithProvider( () => useHelpCenterSite() );

		expect( result.current.site ).toBe( selectedSite );
		expect( result.current.siteContextSource ).toBe( 'calypso_selected_site' );
	} );

	it( 'falls back to URL-param site before primary site', () => {
		window.history.replaceState( {}, '', '/?siteId=2' );
		mockGetSite.mockReturnValue( urlParamSite );
		mockGetPrimarySiteSlug.mockReturnValue( 'primary-site' );
		mockGetSiteBySlug.mockReturnValue( primarySite );

		const { result } = renderHookWithProvider( () => useHelpCenterSite() );

		expect( result.current.site ).toBe( urlParamSite );
		expect( result.current.urlParamSite ).toBe( urlParamSite );
		expect( result.current.siteContextSource ).toBe( 'calypso_url_param_site' );
	} );

	it( 'falls back to primary site', () => {
		mockGetPrimarySiteSlug.mockReturnValue( 'primary-site' );
		mockGetSiteBySlug.mockReturnValue( primarySite );

		const { result } = renderHookWithProvider( () => useHelpCenterSite() );

		expect( result.current.site ).toBe( primarySite );
		expect( result.current.siteContextSource ).toBe( 'calypso_primary_site' );
	} );

	it( 'names the source of the site it resolved', () => {
		window.history.replaceState( {}, '', '/?siteId=2' );
		mockGetSelectedSite.mockReturnValue( selectedSite );
		mockGetSite.mockReturnValue( urlParamSite );
		mockGetPrimarySiteSlug.mockReturnValue( 'primary-site' );
		mockGetSiteBySlug.mockReturnValue( primarySite );

		const { result } = renderHookWithProvider( () => useHelpCenterSite() );

		expect( result.current.site ).toBe( selectedSite );
		expect( result.current.siteContextSource ).toBe( 'calypso_selected_site' );
	} );

	it( 'returns no site, and no source, when nothing resolves', () => {
		const { result } = renderHookWithProvider( () => useHelpCenterSite() );

		expect( result.current.site ).toBeNull();
		expect( result.current.siteContextSource ).toBe( 'none' );
	} );
} );
