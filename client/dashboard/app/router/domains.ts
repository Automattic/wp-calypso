import { createRoute, createLazyRoute, redirect } from '@tanstack/react-router';
import { domainQuery } from '../queries/domain';
import { domainDnsQuery } from '../queries/domain-dns-records';
import { domainForwardingQuery } from '../queries/domain-forwarding';
import { domainGlueRecordsQuery } from '../queries/domain-glue-records';
import { sslDetailsQuery } from '../queries/domain-ssl';
import { domainsQuery } from '../queries/domains';
import { queryClient } from '../query-client';
import { rootRoute } from './root';

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

// Standalone domains purchase route - requires rootRoute
export const domainsPurchaseRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'domains/purchase',
} ).lazy( () =>
	import( '../../domains/purchase' ).then( ( d ) =>
		createLazyRoute( 'domains-purchase' )( {
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
	import( '../../domains/domain-overview' ).then( ( d ) =>
		createLazyRoute( 'domain-overview' )( {
			component: d.default,
		} )
	)
);

// Domain DNS routes
export const domainDnsRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'dns',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainDnsQuery( domainName ) ),
} ).lazy( () =>
	import( '../../domains/domain-dns' ).then( ( d ) =>
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
	beforeLoad: async ( { params: { domainName }, search } ) => {
		// If the provided recordId doesn't exist, redirect to the DNS overview page
		const { recordId } = search as { recordId: string | undefined };
		const dnsRecords = await queryClient.ensureQueryData( domainDnsQuery( domainName ) );
		const record = dnsRecords?.records.find( ( record ) => record.id === recordId );
		if ( ! record ) {
			throw redirect( { to: '/domains/$domainName/dns', params: { domainName } } );
		}
	},
	loader: ( { params: { domainName } } ) => {
		return queryClient.ensureQueryData( domainDnsQuery( domainName ) );
	},
	validateSearch: ( search ): { recordId: string | undefined } => {
		// Ensure we have a recordId query parameter
		return {
			recordId: typeof search.recordId === 'string' ? search.recordId : undefined,
		};
	},
} ).lazy( () =>
	import( '../../domains/dns/edit' ).then( ( d ) =>
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
	path: 'forwardings/add',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainForwardingQuery( domainName ) ),
} ).lazy( () =>
	import( '../../domains/domain-forwardings/add' ).then( ( d ) =>
		createLazyRoute( 'domain-forwardings-add' )( {
			component: d.default,
		} )
	)
);

export const domainForwardingEditRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'forwardings/edit/$forwardingId',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainForwardingQuery( domainName ) ),
} ).lazy( () =>
	import( '../../domains/domain-forwardings/edit' ).then( ( d ) =>
		createLazyRoute( 'domain-forwardings-edit' )( {
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
	import( '../../domains/name-servers' ).then( ( d ) =>
		createLazyRoute( 'domain-name-servers' )( {
			component: d.default,
		} )
	)
);

export const domainGlueRecordsRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'glue-records',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainGlueRecordsQuery( domainName ) ),
} ).lazy( () =>
	import( '../../domains/overview-glue-records' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records' )( {
			component: d.default,
		} )
	)
);

export const domainGlueRecordsAddRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'glue-records/add',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records-add' )( {
			component: d.default,
		} )
	)
);

export const domainGlueRecordsEditRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'glue-records/edit/$nameServer',
} ).lazy( () =>
	import( '../../sites/domains/placeholder' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records-edit' )( {
			component: d.default,
		} )
	)
);

export const domainDnssecRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'dnssec',
} ).lazy( () =>
	import( '../../domains/domain-dnssec' ).then( ( d ) =>
		createLazyRoute( 'domain-dnssec' )( {
			component: d.default,
		} )
	)
);

export const domainSecurityRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'security',
	loader: ( { params: { domainName } } ) => {
		return queryClient.ensureQueryData( sslDetailsQuery( domainName ) );
	},
} ).lazy( () =>
	import( '../../domains/domain-security' ).then( ( d ) =>
		createLazyRoute( 'domain-security' )( {
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

export const createDomainsRoutes = () => {
	return [
		domainsRoute,
		domainsPurchaseRoute,
		domainRoute.addChildren( [
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
			domainGlueRecordsAddRoute,
			domainGlueRecordsEditRoute,
			domainDnssecRoute,
			domainTransferRoute,
			domainSecurityRoute,
		] ),
	];
};
