import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { domainsQuery } from '../queries/domains';
import { queryClient } from '../query-client';
import type { AnyRoute } from '@tanstack/react-router';

// This will be passed in from the main router to avoid circular imports
let siteRoute: AnyRoute;
let rootRoute: AnyRoute;

export const setRootRoute = ( route: AnyRoute ) => {
	rootRoute = route;
};

export const setSiteRoute = ( route: AnyRoute ) => {
	siteRoute = route;
};

// Standalone domains route - requires rootRoute
export const domainsRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'domains',
	loader: () => queryClient.ensureQueryData( domainsQuery() ),
} ).lazy( () =>
	import( '../../domains' ).then( ( d ) =>
		createLazyRoute( 'domains' )( {
			component: d.default,
		} )
	)
);

// TODO: Add all domains domain management routes here or figure out how to do that with the definitions below

// Site domains route
export const siteDomainsRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'domains',
} ).lazy( () =>
	import( '../../sites/domains' ).then( ( d ) =>
		createLazyRoute( 'site-domains' )( {
			component: d.default,
		} )
	)
);

// Site domain management route
export const siteDomainRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: 'domains/$domainName',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domains' )( {
			component: d.default,
		} )
	)
);

// Site domain DNS routes
export const siteDomainDnsRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'dns',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-dns' )( {
			component: d.default,
		} )
	)
);

export const siteDomainDnsAddRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'dns/add',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-dns-add' )( {
			component: d.default,
		} )
	)
);

export const siteDomainDnsEditRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'dns/edit',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-dns-edit' )( {
			component: d.default,
		} )
	)
);

// Site domain forwarding routes
export const siteDomainForwardingRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'forwarding',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-forwarding' )( {
			component: d.default,
		} )
	)
);

export const siteDomainForwardingAddRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'forwarding/add',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-forwarding-add' )( {
			component: d.default,
		} )
	)
);

export const siteDomainForwardingEditRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'forwarding/edit',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-forwarding-edit' )( {
			component: d.default,
		} )
	)
);

export const siteDomainContactInfoRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'contact_info',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-contact-info' )( {
			component: d.default,
		} )
	)
);

export const siteDomainNameServersRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'name_servers',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-name-servers' )( {
			component: d.default,
		} )
	)
);

export const siteDomainGlueRecordsRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'glue_records',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-glue-records' )( {
			component: d.default,
		} )
	)
);

export const siteDomainDnssecRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'dnssec',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-dnssec' )( {
			component: d.default,
		} )
	)
);

export const siteDomainTransferRoute = createRoute( {
	getParentRoute: () => siteDomainRoute,
	path: 'transfer',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'site-domain-transfer' )( {
			component: d.default,
		} )
	)
);

// Export all site domain child routes for easy inclusion
export const siteDomainChildRoutes: AnyRoute[] = [
	siteDomainDnsRoute,
	siteDomainDnsAddRoute,
	siteDomainDnsEditRoute,
	siteDomainForwardingRoute,
	siteDomainForwardingAddRoute,
	siteDomainForwardingEditRoute,
	siteDomainContactInfoRoute,
	siteDomainNameServersRoute,
	siteDomainGlueRecordsRoute,
	siteDomainDnssecRoute,
	siteDomainTransferRoute,
];
