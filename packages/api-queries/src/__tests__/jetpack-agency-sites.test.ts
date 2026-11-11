import { fetchAgencySites } from '@automattic/api-core';
import { agencyQuery } from '../agency';
import { agencySiteQuery } from '../jetpack-agency-sites';
import { queryClient } from '../query-client';
import { siteBySlugQuery } from '../site';
import type { AgencySite, FetchAgencySitesOptions, Site } from '@automattic/api-core';

// Same-instance query client so the queries and the test share state.
jest.mock( '../query-client', () => {
	const { QueryClient: QC } = jest.requireActual( '@tanstack/react-query' );
	const qc = new QC( { defaultOptions: { queries: { retry: false } } } );
	return { queryClient: qc };
} );

jest.mock( '@tanstack/react-router', () => ( {
	notFound: () => new Error( 'Not found' ),
} ) );

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchAgencySites: jest.fn(),
} ) );

const mockFetchAgencySites = fetchAgencySites as jest.MockedFunction< typeof fetchAgencySites >;

const AGENCY_ID = 123;
const SITE_SLUG = 'devsite.wpcomstaging.com';
const BLOG_ID = 456;

function makeAgencySite( blogId: number, url: string ): AgencySite {
	return { blog_id: blogId, url } as AgencySite;
}

function mockEndpoint( { indexed, all }: { indexed: AgencySite[]; all: AgencySite[] } ) {
	mockFetchAgencySites.mockImplementation(
		async ( _agencyId: number, { search, per_page }: FetchAgencySitesOptions = {} ) => {
			const sites = search ? indexed.filter( ( site ) => site.url.includes( search ) ) : all;
			return { sites: sites.slice( 0, per_page ), total: sites.length };
		}
	);
}

describe( 'agencySiteQuery', () => {
	beforeEach( () => {
		queryClient.clear();
		mockFetchAgencySites.mockReset();
		queryClient.setQueryData( agencyQuery().queryKey, {
			id: AGENCY_ID,
			isClientUser: false,
			hasAgency: true,
		} );
		queryClient.setQueryData( siteBySlugQuery( SITE_SLUG ).queryKey, {
			ID: BLOG_ID,
			slug: SITE_SLUG,
		} as Site );
	} );

	it( 'finds a site the index stores under its other domain', async () => {
		const indexedSite = makeAgencySite( BLOG_ID, 'devsite.wordpress.com' );
		mockEndpoint( { indexed: [ indexedSite ], all: [ indexedSite ] } );

		await expect( queryClient.fetchQuery( agencySiteQuery( SITE_SLUG ) ) ).resolves.toEqual(
			indexedSite
		);
		expect( mockFetchAgencySites ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to the full list when the search misses', async () => {
		const site = makeAgencySite( BLOG_ID, 'example.com' );
		mockEndpoint( { indexed: [], all: [ makeAgencySite( 1, 'other.wordpress.com' ), site ] } );

		await expect( queryClient.fetchQuery( agencySiteQuery( SITE_SLUG ) ) ).resolves.toEqual( site );
	} );

	it( 'does not match a search result with a different blog ID', async () => {
		const otherSite = makeAgencySite( 1, SITE_SLUG );
		mockEndpoint( { indexed: [ otherSite ], all: [ otherSite ] } );

		await expect( queryClient.fetchQuery( agencySiteQuery( SITE_SLUG ) ) ).resolves.toBeNull();
	} );

	it( 'returns null when the agency has no sites', async () => {
		mockEndpoint( { indexed: [], all: [] } );

		await expect( queryClient.fetchQuery( agencySiteQuery( SITE_SLUG ) ) ).resolves.toBeNull();
	} );
} );
