/* eslint-disable no-restricted-imports */
import {
	sitesQuery,
	paginatedSitesQuery,
	dashboardSiteFiltersQuery,
	domainsQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import { isEnabled } from '@automattic/calypso-config';
import boot from '../app/boot';
import { setWorkspace } from '../app/workspace';
import {
	getMockDomains,
	getMockSitesForPersona,
	hydrateMockBloggerSites,
	isRemoteMsd,
	seedMockBloggerSiteCaches,
} from '../sites/overview-blogger/mock-sites';
import Logo from './logo';
import { initPrototypeControls } from './prototype-controls';
import type {
	FetchSitesOptions,
	FetchPaginatedSitesOptions,
	FetchDashboardSiteFiltersParams,
	DomainSummary,
	FetchPaginatedSitesResponse,
	Site,
} from '@automattic/api-core';
import './style.scss';

seedMockBloggerSiteCaches();
initPrototypeControls();

// Demo personas: `?persona=blogger` shows a single photography site in the
// Essential workspace; `?persona=developer` restores the multi-site setup in
// the Advanced workspace. The choice persists until the other link is opened.
const PERSONA_STORAGE_KEY = 'dashboard-demo-persona';

function resolvePersona(): 'developer' | 'blogger' {
	if ( typeof window === 'undefined' ) {
		return 'developer';
	}
	const requested = new URLSearchParams( window.location.search ).get( 'persona' );
	if ( requested === 'blogger' || requested === 'developer' ) {
		window.localStorage.setItem( PERSONA_STORAGE_KEY, requested );
		setWorkspace( requested === 'blogger' ? 'essential' : 'advanced' );
	}
	return window.localStorage.getItem( PERSONA_STORAGE_KEY ) === 'blogger' ? 'blogger' : 'developer';
}

const persona = resolvePersona();
const mockSites = getMockSitesForPersona( persona );

// On a remote MSD (calypso.live) every visitor sees the same demo: the mock
// sites only, never mixed with their own account's real sites.
const mocksOnly = persona === 'blogger' || isRemoteMsd();

const sitesQueryWithMocks = ( fetchSiteOptions?: FetchSitesOptions ) => {
	const query = sitesQuery( 'all', fetchSiteOptions );
	const baseQueryFn = query.queryFn as () => Promise< Site[] >;
	return {
		...query,
		queryFn: mocksOnly
			? async () => {
					await hydrateMockBloggerSites();
					return mockSites;
			  }
			: async () => {
					const [ realSites ] = await Promise.all( [ baseQueryFn(), hydrateMockBloggerSites() ] );
					return [ ...mockSites, ...realSites ];
			  },
	};
};

const paginatedSitesQueryWithMocks = ( fetchSiteOptions?: FetchPaginatedSitesOptions ) => {
	const query = paginatedSitesQuery( 'all', fetchSiteOptions );
	const baseQueryFn = query.queryFn as () => Promise< FetchPaginatedSitesResponse >;
	return {
		...query,
		queryFn: async () => {
			const [ response ] = await Promise.all( [ baseQueryFn(), hydrateMockBloggerSites() ] );
			if ( mocksOnly ) {
				return { ...response, sites: mockSites, total: mockSites.length };
			}
			return {
				...response,
				sites: [ ...mockSites, ...response.sites ],
				total: response.total + mockSites.length,
			};
		},
	};
};

// The mock sites each own their free wpcom subdomain; blogger persona shows
// only those, developer prepends them to the account's real domains.
const domainsQueryWithMocks = () => {
	const query = domainsQuery();
	const baseQueryFn = query.queryFn as () => Promise< DomainSummary[] >;
	const mockDomains = getMockDomains().filter( ( domain ) =>
		mockSites.some( ( site ) => site.ID === domain.blog_id )
	);
	return {
		...query,
		queryFn: mocksOnly
			? async () => mockDomains
			: async () => [ ...mockDomains, ...( await baseQueryFn() ) ],
	};
};

boot( {
	name: 'WordPress.com',
	basePath: '/',
	mainRoute: '/sites',
	Logo,
	supports: {
		agency: false,
		agencyClient: false,
		sites: true,
		domains: true,
		emails: true,
		themes: false,
		reader: true,
		help: true,
		notifications: true,
		resurrectedWelcomeModal: true,
		me: {
			billing: {
				monetizeSubscriptions: true,
			},
			security: {
				sshKey: true,
			},
			apps: true,
		},
		plugins: true,
		commandPalette: false,
		domainOnlySites: true,
		legacyPathRedirects: [ '/stats', '/plans', '/reader', '/overview' ],
		siteOverview: {
			preview: false,
		},
		colorScheme: isEnabled( 'dark-mode' ),
		darkMode: isEnabled( 'dark-mode' ),
	},
	optIn: true,
	components: {
		sites: () => import( '../sites' ),
		siteSwitcher: () => import( '../sites/site-switcher' ),
	},
	queries: {
		sitesQuery: sitesQueryWithMocks,
		paginatedSitesQuery: paginatedSitesQueryWithMocks,
		dashboardSiteFiltersQuery: ( fields: FetchDashboardSiteFiltersParams[ 'fields' ] ) =>
			dashboardSiteFiltersQuery( 'all', fields ),
		domainsQuery: domainsQueryWithMocks,
	},
} );
