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
	} );

	it( 'falls back to URL-param site before primary site', () => {
		window.history.replaceState( {}, '', '/?siteId=2' );
		mockGetSite.mockReturnValue( urlParamSite );
		mockGetPrimarySiteSlug.mockReturnValue( 'primary-site' );
		mockGetSiteBySlug.mockReturnValue( primarySite );

		const { result } = renderHookWithProvider( () => useHelpCenterSite() );

		expect( result.current.site ).toBe( urlParamSite );
		expect( result.current.urlParamSite ).toBe( urlParamSite );
	} );

	it( 'falls back to primary site', () => {
		mockGetPrimarySiteSlug.mockReturnValue( 'primary-site' );
		mockGetSiteBySlug.mockReturnValue( primarySite );

		const { result } = renderHookWithProvider( () => useHelpCenterSite() );

		expect( result.current.site ).toBe( primarySite );
	} );

	it( 'returns no site when no candidate resolves', () => {
		const { result } = renderHookWithProvider( () => useHelpCenterSite() );

		expect( result.current.site ).toBeNull();
	} );
} );
