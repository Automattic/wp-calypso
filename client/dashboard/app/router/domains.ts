import {
	domainQuery,
	domainDnsQuery,
	domainForwardingQuery,
	domainGlueRecordsQuery,
	domainNameServersQuery,
	sslDetailsQuery,
	domainsQuery,
	mailboxesQuery,
	siteByIdQuery,
	queryClient,
	domainTransferRequestQuery,
	domainWhoisQuery,
} from '@automattic/api-queries';
import {
	createRoute,
	createLazyRoute,
	notFound,
	redirect,
	lazyRouteComponent,
} from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
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

// Domain management root route
export const domainRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'domains/$domainName',
	loader: async ( { params: { domainName }, location } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		const isNameServersSubRoute = location.pathname.includes( '/name-servers' );

		// If navigating to name-servers sub-route and user doesn't have permission,
		// throw error and handle it with the global error boundary
		if ( isNameServersSubRoute && ! domain.can_manage_name_servers ) {
			throw new Error(
				domain.cannot_manage_name_servers_reason ||
					__( 'You do not have permission to manage name servers.' )
			);
		}

		return domain;
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
	loader: async ( { params: { domainName } } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		const [ site, mailboxes ] = await Promise.all( [
			queryClient.ensureQueryData( siteByIdQuery( domain.blog_id ) ),
			queryClient.ensureQueryData( mailboxesQuery( domain.blog_id ) ),
		] );

		return { domain, site, mailboxes };
	},
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
	loader: async ( { params: { domainName } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( domainQuery( domainName ) ),
			queryClient.ensureQueryData( domainForwardingQuery( domainName ) ),
		] );
	},
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
	loader: async ( { params: { domainName } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( domainQuery( domainName ) ),
			queryClient.ensureQueryData( domainForwardingQuery( domainName ) ),
		] );
	},
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
	loader: async ( { params: { domainName } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( domainQuery( domainName ) ),
			queryClient.ensureQueryData( domainForwardingQuery( domainName ) ),
		] );
	},
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
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainWhoisQuery( domainName ) ),
} ).lazy( () =>
	import( '../../domains/domain-contact-details' ).then( ( d ) =>
		createLazyRoute( 'domain-contact-info' )( {
			component: d.default,
		} )
	)
);

export const domainNameServersRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'name-servers',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainNameServersQuery( domainName ) ),
	component: lazyRouteComponent( () => import( '../../domains/name-servers' ) ),
	errorComponent: lazyRouteComponent( () => import( '../../domains/name-servers/error' ) ),
} );

export const domainGlueRecordsRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'glue-records',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainGlueRecordsQuery( domainName ) ),
} ).lazy( () =>
	import( '../../domains/domain-glue-records' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records' )( {
			component: d.default,
		} )
	)
);

export const domainGlueRecordsAddRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'glue-records/add',
} ).lazy( () =>
	import( '../../domains/domain-glue-records/add' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records-add' )( {
			component: d.default,
		} )
	)
);

export const domainGlueRecordsEditRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'glue-records/edit/$nameServer',
	beforeLoad: async ( { params: { domainName, nameServer } } ) => {
		const glueRecordsData = await queryClient.ensureQueryData(
			domainGlueRecordsQuery( domainName )
		);
		const glueRecord = glueRecordsData.find(
			( glueRecord ) => glueRecord.nameserver === nameServer
		);

		if ( ! glueRecord ) {
			throw notFound();
		}
	},
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainGlueRecordsQuery( domainName ) ),
} ).lazy( () =>
	import( '../../domains/domain-glue-records/edit' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records-edit' )( {
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
	import( '../../domains/domain-transfer' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer' )( {
			component: d.default,
		} )
	)
);

export const domainTransferToAnyUserRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'transfer/any-user',
	loader: async ( { params: { domainName } } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		await queryClient.ensureQueryData( domainTransferRequestQuery( domainName, domain.site_slug ) );
	},
} ).lazy( () =>
	import( '../../domains/domain-transfer/transfer-domain-to-any-user' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer-to-any-user' )( {
			component: d.default,
		} )
	)
);

export const domainTransferToOtherUserRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: 'transfer/other-user',
	loader: async ( { params: { domainName } } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		await queryClient.ensureQueryData( domainTransferRequestQuery( domainName, domain.site_slug ) );
	},
} ).lazy( () =>
	import( '../../domains/domain-transfer/transfer-domain-to-other-user' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer-to-other-user' )( {
			component: d.default,
		} )
	)
);

export const createDomainsRoutes = () => {
	return [
		domainsRoute,
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
			domainTransferRoute,
			domainTransferToAnyUserRoute,
			domainTransferToOtherUserRoute,
			domainSecurityRoute,
		] ),
	];
};
