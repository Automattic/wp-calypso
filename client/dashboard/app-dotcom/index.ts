import { setPrototypeQueryFnOverride } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import boot from '../app/boot';
import { setWorkspace } from '../app/workspace';
import {
	getMockDomains,
	getMockSitesForPersona,
	getMockSitesPlugins,
	hydrateMockBloggerSites,
	isRemoteMsd,
	mockSitePreviewImage,
	seedMockBloggerSiteCaches,
} from '../sites/overview-blogger/mock-sites';
import { setPrototypePreviewImageResolver } from '../sites/site-preview/prototype-preview-image';
import { initPrototypeControls } from './prototype-controls';
import type {
	DomainSummary,
	FetchPaginatedSitesResponse,
	PluginsResponse,
	Site,
} from '@automattic/api-core';
import './style.scss';

setPrototypePreviewImageResolver( mockSitePreviewImage );
seedMockBloggerSiteCaches();
initPrototypeControls();

// Demo personas: the blogger is the default (two sites: a Free photo journal
// and a Business studio site on its own domain); `?persona=developer` shows
// the five-site setup and `?persona=blogger` switches back. The choice
// persists until the other link is opened. The workspace value is
// internal state only (the account-menu switcher was removed with the old
// omnibar).
const PERSONA_STORAGE_KEY = 'dashboard-demo-persona';

function resolvePersona(): 'developer' | 'blogger' {
	if ( typeof window === 'undefined' ) {
		return 'blogger';
	}
	const requested = new URLSearchParams( window.location.search ).get( 'persona' );
	if ( requested === 'blogger' || requested === 'developer' ) {
		window.localStorage.setItem( PERSONA_STORAGE_KEY, requested );
		setWorkspace( requested === 'blogger' ? 'essential' : 'advanced' );
	}
	return window.localStorage.getItem( PERSONA_STORAGE_KEY ) === 'developer'
		? 'developer'
		: 'blogger';
}

const persona = resolvePersona();
const mockSites = getMockSitesForPersona( persona );

// On a remote MSD (calypso.live) every visitor sees the same demo: the mock
// sites only, never mixed with their own account's real sites.
const mocksOnly = persona === 'blogger' || isRemoteMsd();

// Mock sites and domains reach every page through the prototype query
// overrides in `@automattic/api-queries` (the old `AppConfig.queries` seam is
// gone on trunk).
setPrototypeQueryFnOverride< Site[] >( 'sites', async ( base ) => {
	if ( mocksOnly ) {
		await hydrateMockBloggerSites();
		return mockSites;
	}
	const [ realSites ] = await Promise.all( [ base(), hydrateMockBloggerSites() ] );
	return [ ...mockSites, ...realSites ];
} );

setPrototypeQueryFnOverride< FetchPaginatedSitesResponse >( 'paginatedSites', async ( base ) => {
	const [ response ] = await Promise.all( [ base(), hydrateMockBloggerSites() ] );
	if ( mocksOnly ) {
		return { ...response, sites: mockSites, total: mockSites.length };
	}
	return {
		...response,
		sites: [ ...mockSites, ...response.sites ],
		total: response.total + mockSites.length,
	};
} );

// Each mock site owns its free wpcom subdomain, paid ones add their custom
// domain; the rows are built after hydration so they follow each Studio
// site's live plan.
setPrototypeQueryFnOverride< DomainSummary[] >( 'domains', async ( base ) => {
	const mockDomains = async () => {
		await hydrateMockBloggerSites();
		return getMockDomains().filter( ( domain ) =>
			mockSites.some( ( site ) => site.ID === domain.blog_id )
		);
	};
	if ( mocksOnly ) {
		return mockDomains();
	}
	const [ mocks, real ] = await Promise.all( [ mockDomains(), base() ] );
	return [ ...mocks, ...real ];
} );

// The mock sites' installed plugins, so the Plugins pages have rows for them.
// A real account's plugins stay as they are; a failed request (the mock IDs
// do not exist upstream, or there is no session at all) counts as none.
setPrototypeQueryFnOverride< PluginsResponse >( 'plugins', async ( base ) => {
	const [ real ] = await Promise.all( [
		mocksOnly ? Promise.resolve( undefined ) : base().catch( () => undefined ),
		hydrateMockBloggerSites(),
	] );
	return {
		...real,
		sites: {
			...real?.sites,
			...getMockSitesPlugins( mockSites.map( ( site ) => site.ID ) ),
		},
	};
} );

boot( {
	name: 'WordPress.com',
	unifiedAdminPageViewApp: 'msd',
	basePath: '/',
	mainRoute: '/sites',
	Logo: null,
	supports: {
		agency: false,
		agencyClient: false,
		sites: true,
		domains: true,
		emails: true,
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
		commandPalette: true,
		domainOnlySites: true,
		legacyPathRedirects: [ '/stats', '/plans', '/reader', '/overview' ],
		colorScheme: isEnabled( 'dark-mode' ),
		darkMode: isEnabled( 'dark-mode' ),
	},
	components: {},
} );
