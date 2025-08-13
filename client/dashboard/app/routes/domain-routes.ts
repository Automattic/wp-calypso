import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { domainQuery } from '../queries/domain';
import { domainForwardingQuery } from '../queries/domain-forwarding';
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

// Domain management root route
export const domainRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'domains/$domainName',
	loader: ( { params: { domainName } } ) => {
		return queryClient.ensureQueryData( domainQuery( domainName ) );
	},
} ).lazy( () =>
	import( '../../domains/domain' ).then( ( d ) =>
		createLazyRoute( 'domain' )( {
			component: d.default,
		} )
	)
);

export const domainOverviewRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: '/',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain' )( {
			component: d.default,
		} )
	)
);

// Domain DNS routes
export const domainDnsRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'dns',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-dns' )( {
			component: d.default,
		} )
	)
);

export const domainDnsAddRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'dns/add',
} ).lazy( () =>
	import( '../../domains/dns/add' ).then( ( d ) =>
		createLazyRoute( 'domain-dns-add' )( {
			component: d.default,
		} )
	)
);

export const domainDnsEditRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'dns/edit',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-dns-edit' )( {
			component: d.default,
		} )
	)
);

// Domain forwardings routes
export const domainForwardingsRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'forwardings',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainForwardingQuery( domainName ) ),
} ).lazy( () =>
	import( '../../domains/domain-forwardings' ).then( ( d ) =>
		createLazyRoute( 'domain-forwardings' )( {
			component: d.default,
		} )
	)
);

export const domainForwardingAddRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'forwarding/add',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-forwarding-add' )( {
			component: d.default,
		} )
	)
);

export const domainForwardingEditRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'forwarding/edit/$forwardingId',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-forwarding-edit' )( {
			component: d.default,
		} )
	)
);

export const domainContactInfoRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'contact-info',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-contact-info' )( {
			component: d.default,
		} )
	)
);

export const domainNameServersRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'name-servers',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-name-servers' )( {
			component: d.default,
		} )
	)
);

export const domainGlueRecordsRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'glue-records',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records' )( {
			component: d.default,
		} )
	)
);

export const domainDnssecRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'dnssec',
} ).lazy( () =>
	import( '../../domains/overview-dnssec' ).then( ( d ) =>
		createLazyRoute( 'domain-dnssec' )( {
			component: d.default,
		} )
	)
);

export const domainTransferRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'transfer',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer' )( {
			component: d.default,
		} )
	)
);

// Export all domain child routes for easy inclusion
export const domainChildRoutes: AnyRoute[] = [
	domainOverviewRoute,
	domainDnsRoute,
	domainDnsAddRoute,
	domainDnsEditRoute,
	domainForwardingsRoute,
	domainForwardingAddRoute,
	domainForwardingEditRoute,
	domainContactInfoRoute,
	domainNameServersRoute,
	domainGlueRecordsRoute,
	domainDnssecRoute,
	domainTransferRoute,
];
