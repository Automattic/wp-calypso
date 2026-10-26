import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { domainsQuery, sslDetailsQuery, userPurchasesQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRouter,
} from '@tanstack/react-router';
import { Modal } from '@wordpress/components';
import { useState } from 'react';
import { AnalyticsProvider } from '../../app/analytics';
import { AuthContext } from '../../app/auth';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../app/context';
import { createDomainsRoutes } from '../../app/router/domains';
import { createMeRoutes } from '../../app/router/me';
import { rootRoute } from '../../app/router/root';
import { createSitesRoutes } from '../../app/router/sites';
import { DataViews, DataViewsCard } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import AddDomainButton from '../../domains/add-domain-button';
import {
	DEFAULT_LAYOUTS,
	DEFAULT_VIEW,
	SITE_CONTEXT_VIEW,
	filterSortAndPaginateDomains,
	getSiteDomainPinnedRank,
	useActions,
	useFields,
} from '../../domains/dataviews';
import SiteChangeAddressContent from '../site-change-address-modal/content';
import PrimaryDomainSelectorNotice from './primary-domain-selector-notice';
import type { AppConfig } from '../../app/context';
import type { DomainSummary, Site, User } from '@automattic/api-core';
import type { Meta, StoryObj } from '@storybook/react';
import type { View } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

const SITE_ID = 1;
const OTHER_SITE_ID = 2;

const user = {
	ID: 10,
	username: 'icecream',
	email: 'icecream@example.com',
	language: 'en',
	meta: { data: { flags: { active_flags: [] } } },
} as unknown as User;

const site = {
	ID: SITE_ID,
	name: 'Ice Cream Shop',
	slug: 'icecreamshop.com',
	URL: 'https://icecreamshop.com',
	site_owner: user.ID,
	is_wpcom_atomic: false,
	plan: { is_free: false, features: { active: [ 'set-primary-custom-domain' ] } },
	options: {},
} as unknown as Site;

const otherSite = {
	...site,
	ID: OTHER_SITE_ID,
	name: 'Sweet Ice Cream',
	slug: 'sweeticecream.co',
	URL: 'https://sweeticecream.co',
} as unknown as Site;

const baseDomain = {
	blog_id: SITE_ID,
	blog_name: 'Ice Cream Shop',
	site_slug: 'icecreamshop.com',
	auto_renewing: true,
	current_user_is_owner: true,
	is_domain_only_site: false,
	expiry: '2027-09-27T00:00:00+00:00',
	expired: false,
	primary_domain: false,
	can_set_as_primary: true,
	set_primary_domain_pending: false,
	domain_status: { id: DomainStatus.ACTIVE, label: 'Active', type: 'success' },
	subscription_id: '1',
	tags: [],
} as const;

const siteDomains = [
	{
		...baseDomain,
		domain: 'icecreamshop.wordpress.com',
		subtype: { id: DomainSubtype.DEFAULT_ADDRESS, label: 'Included site address' },
		expiry: null,
		auto_renewing: false,
		subscription_id: null,
	},
	{
		...baseDomain,
		domain: 'icecreamshop.com',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain name registration' },
		primary_domain: true,
		subscription_id: '2',
	},
	{
		...baseDomain,
		domain: 'icecreamnews.blog',
		subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Connected domain name' },
		auto_renewing: false,
		expiry: '2026-11-12T00:00:00+00:00',
		subscription_id: '3',
	},
	{
		...baseDomain,
		domain: 'icecreamvan.com',
		subtype: { id: DomainSubtype.DOMAIN_TRANSFER, label: 'Domain name transfer' },
		domain_status: { id: DomainStatus.IN_PROGRESS, label: 'Transfer in progress', type: 'warning' },
		can_set_as_primary: false,
		expiry: null,
		subscription_id: '4',
	},
] as unknown as DomainSummary[];

const allDomains = [
	...siteDomains,
	{
		...baseDomain,
		domain: 'sweeticecream.co',
		blog_id: OTHER_SITE_ID,
		blog_name: 'Sweet Ice Cream',
		site_slug: 'sweeticecream.co',
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain name registration' },
		primary_domain: true,
		expiry: '2027-10-17T00:00:00+00:00',
		subscription_id: '5',
	},
] as unknown as DomainSummary[];

const appConfig: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		sites: true,
		domains: true,
		me: { billing: false, security: false, apps: false },
		domainOnlySites: true,
	},
};

// Components build links from the dashboard routes' `fullPath`, which TanStack Router only
// computes once a route is part of a router's tree. This router is never rendered.
createRouter( {
	context: { config: appConfig },
	routeTree: rootRoute.addChildren( [
		...createSitesRoutes( appConfig ),
		...createDomainsRoutes(),
		...createMeRoutes( appConfig ),
	] ),
} );

function createQueryClient( domains: DomainSummary[] ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );
	queryClient.setQueryData( domainsQuery().queryKey, domains );
	queryClient.setQueryData( userPurchasesQuery().queryKey, [] );
	domains.forEach( ( { domain } ) =>
		queryClient.setQueryData( sslDetailsQuery( domain ).queryKey, {
			certificate_provisioned: true,
			is_newly_registered: false,
			is_expired: false,
		} )
	);
	return queryClient;
}

function Providers( { children, domains }: { children: ReactNode; domains: DomainSummary[] } ) {
	const [ queryClient ] = useState( () => createQueryClient( domains ) );
	const [ router ] = useState( () =>
		createRouter( {
			routeTree: createRootRoute( { component: () => <>{ children }</> } ),
			history: createMemoryHistory(),
		} )
	);

	return (
		<QueryClientProvider client={ queryClient }>
			<AppProvider config={ appConfig }>
				<AnalyticsProvider client={ { recordTracksEvent: () => {}, recordPageView: () => {} } }>
					<AuthContext.Provider value={ { user, logout: () => Promise.resolve() } }>
						<RouterProvider router={ router } context={ { config: { basePath: '/' } } } />
					</AuthContext.Provider>
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);
}

function getDomainId( domain: DomainSummary ) {
	return `${ domain.domain }-${ domain.blog_id }`;
}

/**
 * A reduced copy of the site-level domains page (`/sites/:site/domains`):
 * header, primary site address notice and the domains table.
 */
function SiteDomainsList() {
	const [ view, setView ] = useState< View >( SITE_CONTEXT_VIEW );
	const fields = useFields( { site } );
	const actions = useActions( { sites: [ site ] } );
	const { data, paginationInfo } = filterSortAndPaginateDomains( siteDomains, view, fields, {
		getPinnedRank: getSiteDomainPinnedRank,
	} );

	return (
		<PageLayout
			header={ <PageHeader title="Domains" actions={ <AddDomainButton /> } /> }
			notices={
				<PrimaryDomainSelectorNotice domains={ siteDomains } site={ site } user={ user } />
			}
		>
			<DataViewsCard>
				<DataViews< DomainSummary >
					data={ data }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					actions={ actions }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					defaultLayouts={ DEFAULT_LAYOUTS }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

/**
 * A reduced copy of the all-domains page (`/domains`).
 */
function AllDomainsList() {
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const fields = useFields( { showPrimaryDomainBadge: false } );
	const domains = allDomains.filter(
		( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS
	);
	const actions = useActions( { sites: [ site, otherSite ] } );
	const { data, paginationInfo } = filterSortAndPaginateDomains( domains, view, fields );

	return (
		<PageLayout header={ <PageHeader title="Domains" actions={ <AddDomainButton /> } /> }>
			<DataViewsCard>
				<DataViews< DomainSummary >
					data={ data }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					actions={ actions }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					defaultLayouts={ DEFAULT_LAYOUTS }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

function ChangeSiteAddressModal() {
	return (
		<Modal title="Change site address" onRequestClose={ () => {} } size="medium">
			<SiteChangeAddressContent site={ site } domain={ siteDomains[ 0 ] } onClose={ () => {} } />
		</Modal>
	);
}

const meta = {
	title: 'client/dashboard/Domains/Domains list',
	parameters: { layout: 'fullscreen' },
	decorators: [
		( Story, { parameters } ) => (
			<Providers domains={ parameters.domains ?? allDomains }>
				<Story />
			</Providers>
		),
	],
} satisfies Meta;

export default meta;
type Story = StoryObj< typeof meta >;

export const SiteDomains: Story = {
	render: () => <SiteDomainsList />,
};

export const AllDomains: Story = {
	render: () => <AllDomainsList />,
};

export const SiteDomainsChangeSiteAddress: Story = {
	render: () => <ChangeSiteAddressModal />,
};

export const SiteDomainsChangeSiteAddressWithoutCustomDomain: Story = {
	parameters: { domains: [ siteDomains[ 0 ] ] },
	render: () => <ChangeSiteAddressModal />,
};
