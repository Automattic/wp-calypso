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
	domainConnectionSetupInfoQuery,
	rawUserPreferencesQuery,
	domainAvailabilityQuery,
	domainInboundTransferStatusQuery,
} from '@automattic/api-queries';
import {
	createRoute,
	createLazyRoute,
	notFound,
	redirect,
	lazyRouteComponent,
} from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { StepName } from '../../domains/domain-connection-setup/types';
import {
	checkDomainNameServersPermissions,
	checkDomainTransferPermissions,
	checkDomainContactInfoPermissions,
	checkDomainDnsRecordsPermissions,
	checkDomainContactVerificationPermissions,
} from '../../utils/domain-permissions';
import { rootRoute } from './root';

// Standalone domains route - requires rootRoute
export const domainsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Domains' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'domains',
	loader: async ( { context } ) => {
		queryClient.ensureQueryData( domainsQuery() );
		queryClient.ensureQueryData( context.config.queries.sitesQuery() );
		await queryClient.ensureQueryData( rawUserPreferencesQuery() );
	},
} ).lazy( () =>
	import( '../../domains' ).then( ( d ) =>
		createLazyRoute( 'domains' )( {
			component: d.default,
		} )
	)
);

// Domain management root route
export const domainRoute = createRoute( {
	head: ( { params } ) => ( {
		meta: [
			{
				title: params.domainName,
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'domains/$domainName',
	loader: async ( { params: { domainName }, location } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		const isNameServersSubRoute = location.pathname.includes( '/name-servers' );
		const isTransferSubRoute = location.pathname.includes( '/transfer' );
		const isContactInfoSubRoute = location.pathname.includes( '/contact-info' );
		const isDnsSubRoute = location.pathname.includes( '/dns' );
		const isContactVerificationSubRoute = location.pathname.includes( '/contact-verification' );

		// For generic sub-routes permissions checks,
		// throw error and handle it with the global error boundary
		if ( isNameServersSubRoute ) {
			checkDomainNameServersPermissions( domain );
		}

		if ( isTransferSubRoute ) {
			checkDomainTransferPermissions( domain );
		}

		if ( isContactInfoSubRoute ) {
			checkDomainContactInfoPermissions( domain );
		}

		if ( isDnsSubRoute ) {
			checkDomainDnsRecordsPermissions( domain );
		}

		if ( isContactVerificationSubRoute ) {
			checkDomainContactVerificationPermissions( domain );
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

		queryClient.ensureQueryData( siteByIdQuery( domain.blog_id ) );
		queryClient.ensureQueryData( mailboxesQuery( domain.blog_id ) );
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
	head: () => ( {
		meta: [
			{
				title: __( 'DNS records' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'dns',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainDnsQuery( domainName ) ),
} );

export const domainDnsIndexRoute = createRoute( {
	getParentRoute: () => domainDnsRoute,
	path: '/',
} ).lazy( () =>
	import( '../../domains/domain-dns' ).then( ( d ) =>
		createLazyRoute( 'domain-dns' )( {
			component: d.default,
		} )
	)
);

export const domainDnsAddRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Add a new DNS record' ),
			},
		],
	} ),
	getParentRoute: () => domainDnsRoute,
	path: 'add',
} ).lazy( () =>
	import( '../../domains/dns/add' ).then( ( d ) =>
		createLazyRoute( 'domain-dns-add' )( {
			component: d.default,
		} )
	)
);

export const domainDnsEditRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Edit DNS record' ),
			},
		],
	} ),
	getParentRoute: () => domainDnsRoute,
	path: 'edit',
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

// Domain forwarding routes
export const domainForwardingRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Domain forwarding' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'forwarding',
	loader: async ( { params: { domainName } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( domainQuery( domainName ) ),
			queryClient.ensureQueryData( domainForwardingQuery( domainName ) ),
		] );
	},
} );

export const domainForwardingIndexRoute = createRoute( {
	getParentRoute: () => domainForwardingRoute,
	path: '/',
} ).lazy( () =>
	import( '../../domains/domain-forwarding' ).then( ( d ) =>
		createLazyRoute( 'domain-forwarding' )( {
			component: d.default,
		} )
	)
);

export const domainForwardingAddRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Add domain forwarding' ),
			},
		],
	} ),
	getParentRoute: () => domainForwardingRoute,
	path: 'add',
	loader: async ( { params: { domainName } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( domainQuery( domainName ) ),
			queryClient.ensureQueryData( domainForwardingQuery( domainName ) ),
		] );
	},
} ).lazy( () =>
	import( '../../domains/domain-forwarding/add' ).then( ( d ) =>
		createLazyRoute( 'domain-forwarding-add' )( {
			component: d.default,
		} )
	)
);

export const domainForwardingEditRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Edit domain forwarding' ),
			},
		],
	} ),
	getParentRoute: () => domainForwardingRoute,
	path: 'edit/$forwardingId',
	loader: async ( { params: { domainName } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( domainQuery( domainName ) ),
			queryClient.ensureQueryData( domainForwardingQuery( domainName ) ),
		] );
	},
} ).lazy( () =>
	import( '../../domains/domain-forwarding/edit' ).then( ( d ) =>
		createLazyRoute( 'domain-forwarding-edit' )( {
			component: d.default,
		} )
	)
);

export const domainContactInfoRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Contact details' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'contact-info',
	loader: async ( { params: { domainName } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( domainQuery( domainName ) ),
			queryClient.ensureQueryData( domainWhoisQuery( domainName ) ),
		] );
	},
} ).lazy( () =>
	import( '../../domains/domain-contact-details' ).then( ( d ) =>
		createLazyRoute( 'domain-contact-info' )( {
			component: d.default,
		} )
	)
);

export const domainContactVerificationRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Contact verification' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'contact-verification',
	loader: async ( { params: { domainName } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( domainQuery( domainName ) ),
			queryClient.ensureQueryData( domainWhoisQuery( domainName ) ),
		] );
	},
} ).lazy( () =>
	import( '../../domains/domain-contact-verification' ).then( ( d ) =>
		createLazyRoute( 'domain-contact-verification' )( {
			component: d.default,
		} )
	)
);

export const domainNameServersRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Name servers' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'name-servers',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainNameServersQuery( domainName ) ),
	component: lazyRouteComponent( () => import( '../../domains/name-servers' ) ),
	errorComponent: lazyRouteComponent( () => import( '../../domains/name-servers/error' ) ),
} );

export const domainGlueRecordsRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Glue records' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'glue-records',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainGlueRecordsQuery( domainName ) ),
} );

export const domainGlueRecordsIndexRoute = createRoute( {
	getParentRoute: () => domainGlueRecordsRoute,
	path: '/',
} ).lazy( () =>
	import( '../../domains/domain-glue-records' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records' )( {
			component: d.default,
		} )
	)
);

export const domainGlueRecordsAddRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Add glue record' ),
			},
		],
	} ),
	getParentRoute: () => domainGlueRecordsRoute,
	path: 'add',
} ).lazy( () =>
	import( '../../domains/domain-glue-records/add' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records-add' )( {
			component: d.default,
		} )
	)
);

export const domainGlueRecordsEditRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Edit glue record' ),
			},
		],
	} ),
	getParentRoute: () => domainGlueRecordsRoute,
	path: 'edit/$nameServer',
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
	head: () => ( {
		meta: [
			{
				title: __( 'Security' ),
			},
		],
	} ),
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
	head: () => ( {
		meta: [
			{
				title: __( 'Transfer' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'transfer',
} );

export const domainTransferIndexRoute = createRoute( {
	getParentRoute: () => domainTransferRoute,
	path: '/',
} ).lazy( () =>
	import( '../../domains/domain-transfer' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer' )( {
			component: d.default,
		} )
	)
);

export const domainTransferToAnyUserRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Transfer to another user' ),
			},
		],
	} ),
	getParentRoute: () => domainTransferRoute,
	path: 'any-user',
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
	head: () => ( {
		meta: [
			{
				title: __( 'Transfer to another user' ),
			},
		],
	} ),
	getParentRoute: () => domainTransferRoute,
	path: 'other-user',
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

export const domainTransferToOtherSiteRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Attach to another site' ),
			},
		],
	} ),
	getParentRoute: () => domainTransferRoute,
	path: 'other-site',
	loader: async ( { params: { domainName } } ) => {
		return queryClient.ensureQueryData( domainQuery( domainName ) );
	},
} ).lazy( () =>
	import( '../../domains/domain-transfer/transfer-domain-to-other-site' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer-to-other-site' )( {
			component: d.default,
		} )
	)
);

export const domainConnectionSetupRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Domain connection setup' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'domain-connection-setup',
	loader: async ( { params: { domainName } } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		await queryClient.ensureQueryData(
			domainConnectionSetupInfoQuery(
				domainName,
				domain.blog_id,
				`${ window.location.href }?step=${ StepName.DC_RETURN }`
			)
		);
	},
} ).lazy( () =>
	import( '../../domains/domain-connection-setup' ).then( ( d ) =>
		createLazyRoute( 'domain-connection-setup' )( {
			component: d.default,
		} )
	)
);

export const domainTransferSetupRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Domain transfer setup' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'domain-transfer-setup',
	loader: async ( { params: { domainName } } ) => {
		await Promise.all( [
			queryClient.ensureQueryData( domainAvailabilityQuery( domainName ) ),
			queryClient.ensureQueryData( domainInboundTransferStatusQuery( domainName ) ),
		] );
	},
} ).lazy( () =>
	import( '../../domains/domain-connection-setup/transfer-setup' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer-setup' )( {
			component: d.default,
		} )
	)
);

export const createDomainsRoutes = () => {
	return [
		domainsRoute,
		domainRoute.addChildren( [
			domainOverviewRoute,
			domainDnsRoute.addChildren( [ domainDnsIndexRoute, domainDnsAddRoute, domainDnsEditRoute ] ),
			domainConnectionSetupRoute,
			domainTransferSetupRoute,
			domainForwardingRoute.addChildren( [
				domainForwardingIndexRoute,
				domainForwardingAddRoute,
				domainForwardingEditRoute,
			] ),
			domainContactInfoRoute,
			domainContactVerificationRoute,
			domainNameServersRoute,
			domainGlueRecordsRoute.addChildren( [
				domainGlueRecordsIndexRoute,
				domainGlueRecordsAddRoute,
				domainGlueRecordsEditRoute,
			] ),
			domainTransferRoute.addChildren( [
				domainTransferIndexRoute,
				domainTransferToAnyUserRoute,
				domainTransferToOtherUserRoute,
				domainTransferToOtherSiteRoute,
			] ),
			domainSecurityRoute,
		] ),
	];
};
