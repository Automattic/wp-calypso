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
	createRouter,
	redirect,
	notFound,
	lazyRouteComponent,
} from '@tanstack/react-router';
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { StepName } from 'calypso/dashboard/domains/domain-connection-setup/types';
import {
	checkDomainNameServersPermissions,
	checkDomainTransferPermissions,
	checkDomainContactInfoPermissions,
	checkDomainDnsRecordsPermissions,
	checkDomainContactVerificationPermissions,
} from 'calypso/dashboard/utils/domain-permissions';
import { rootRoute } from '../router';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';

const domainsListRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Domains' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: '/',
	loader: async () => {
		queryClient.ensureQueryData( domainsQuery() );
		queryClient.ensureQueryData( rawUserPreferencesQuery() );
	},
} ).lazy( () =>
	import( 'calypso/dashboard/domains' ).then( ( d ) =>
		createLazyRoute( 'domains' )( {
			component: d.default,
		} )
	)
);

const domainRoute = createRoute( {
	head: ( { params } ) => ( {
		meta: [
			{
				title: params.domainName,
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: '$domain',
	loader: async ( { params: { domainName }, location } ) => {
		console.log( '### domainRoute loader for domain:', domainName );
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		const isNameServersSubRoute = location.pathname.includes( '/name-servers' );
		const isTransferSubRoute = location.pathname.includes( '/transfer' );
		const isContactInfoSubRoute = location.pathname.includes( '/contact-info' );
		const isDnsSubRoute = location.pathname.includes( '/dns' );
		const isContactVerificationSubRoute = location.pathname.includes( '/contact-verification' );

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
	import( 'calypso/dashboard/domains/domain' ).then( ( d ) =>
		createLazyRoute( 'domain' )( {
			component: d.default,
		} )
	)
);

const domainOverviewRoute = createRoute( {
	getParentRoute: () => domainRoute,
	path: '/',
	loader: async ( { params: { domainName } } ) => {
		console.log( '### domainOverviewRoute loader for domain:', domainName );
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		const [ site, mailboxes ] = await Promise.all( [
			queryClient.ensureQueryData( siteByIdQuery( domain.blog_id ) ),
			queryClient.ensureQueryData( mailboxesQuery( domain.blog_id ) ),
		] );

		return { domain, site, mailboxes };
	},
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-overview' ).then( ( d ) =>
		createLazyRoute( 'domain-overview' )( {
			component: d.default,
		} )
	)
);

const domainDnsRoute = createRoute( {
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

const domainDnsIndexRoute = createRoute( {
	getParentRoute: () => domainDnsRoute,
	path: '/',
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-dns' ).then( ( d ) =>
		createLazyRoute( 'domain-dns' )( {
			component: d.default,
		} )
	)
);

const domainDnsAddRoute = createRoute( {
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
	import( 'calypso/dashboard/domains/dns/add' ).then( ( d ) =>
		createLazyRoute( 'domain-dns-add' )( {
			component: d.default,
		} )
	)
);

const domainDnsEditRoute = createRoute( {
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
		const { recordId } = search as { recordId: string | undefined };
		const dnsRecords = await queryClient.ensureQueryData( domainDnsQuery( domainName ) );
		const record = dnsRecords?.records.find( ( dnsRecord ) => dnsRecord.id === recordId );
		if ( ! record ) {
			throw redirect( { to: 'domain/$domainName/dns', params: { domainName } } );
		}
	},
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainDnsQuery( domainName ) ),
	validateSearch: ( search ): { recordId: string | undefined } => ( {
		recordId: typeof search.recordId === 'string' ? search.recordId : undefined,
	} ),
} ).lazy( () =>
	import( 'calypso/dashboard/domains/dns/edit' ).then( ( d ) =>
		createLazyRoute( 'domain-dns-edit' )( {
			component: d.default,
		} )
	)
);

const domainForwardingRoute = createRoute( {
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

const domainForwardingIndexRoute = createRoute( {
	getParentRoute: () => domainForwardingRoute,
	path: '/',
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-forwarding' ).then( ( d ) =>
		createLazyRoute( 'domain-forwarding' )( {
			component: d.default,
		} )
	)
);

const domainForwardingAddRoute = createRoute( {
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
	import( 'calypso/dashboard/domains/domain-forwarding/add' ).then( ( d ) =>
		createLazyRoute( 'domain-forwarding-add' )( {
			component: d.default,
		} )
	)
);

const domainForwardingEditRoute = createRoute( {
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
	import( 'calypso/dashboard/domains/domain-forwarding/edit' ).then( ( d ) =>
		createLazyRoute( 'domain-forwarding-edit' )( {
			component: d.default,
		} )
	)
);

const domainContactInfoRoute = createRoute( {
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
	import( 'calypso/dashboard/domains/domain-contact-details' ).then( ( d ) =>
		createLazyRoute( 'domain-contact-info' )( {
			component: d.default,
		} )
	)
);

const domainContactVerificationRoute = createRoute( {
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
	import( 'calypso/dashboard/domains/domain-contact-verification' ).then( ( d ) =>
		createLazyRoute( 'domain-contact-verification' )( {
			component: d.default,
		} )
	)
);

const domainNameServersRoute = createRoute( {
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
	component: lazyRouteComponent( () => import( 'calypso/dashboard/domains/name-servers' ) ),
	errorComponent: lazyRouteComponent(
		() => import( 'calypso/dashboard/domains/name-servers/error' )
	),
} );

const domainGlueRecordsRoute = createRoute( {
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

const domainGlueRecordsIndexRoute = createRoute( {
	getParentRoute: () => domainGlueRecordsRoute,
	path: '/',
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-glue-records' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records' )( {
			component: d.default,
		} )
	)
);

const domainGlueRecordsAddRoute = createRoute( {
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
	import( 'calypso/dashboard/domains/domain-glue-records/add' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records-add' )( {
			component: d.default,
		} )
	)
);

const domainGlueRecordsEditRoute = createRoute( {
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
		const glueRecord = glueRecordsData.find( ( record ) => record.nameserver === nameServer );

		if ( ! glueRecord ) {
			throw notFound();
		}
	},
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainGlueRecordsQuery( domainName ) ),
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-glue-records/edit' ).then( ( d ) =>
		createLazyRoute( 'domain-glue-records-edit' )( {
			component: d.default,
		} )
	)
);

const domainSecurityRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Security' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'security',
	loader: ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( sslDetailsQuery( domainName ) ),
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-security' ).then( ( d ) =>
		createLazyRoute( 'domain-security' )( {
			component: d.default,
		} )
	)
);

const domainTransferRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Transfer' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'transfer',
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-transfer' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer' )( {
			component: d.default,
		} )
	)
);

const domainTransferToAnyUserRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Transfer to another user' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'transfer/any-user',
	loader: async ( { params: { domainName } } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		await queryClient.ensureQueryData( domainTransferRequestQuery( domainName, domain.site_slug ) );
	},
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-transfer/transfer-domain-to-any-user' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer-to-any-user' )( {
			component: d.default,
		} )
	)
);

const domainTransferToOtherUserRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Transfer to another user' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'transfer/other-user',
	loader: async ( { params: { domainName } } ) => {
		const domain = await queryClient.ensureQueryData( domainQuery( domainName ) );
		await queryClient.ensureQueryData( domainTransferRequestQuery( domainName, domain.site_slug ) );
	},
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-transfer/transfer-domain-to-other-user' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer-to-other-user' )( {
			component: d.default,
		} )
	)
);

const domainTransferToOtherSiteRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Attach to another site' ),
			},
		],
	} ),
	getParentRoute: () => domainRoute,
	path: 'transfer/other-site',
	loader: async ( { params: { domainName } } ) =>
		queryClient.ensureQueryData( domainQuery( domainName ) ),
} ).lazy( () =>
	import( 'calypso/dashboard/domains/domain-transfer/transfer-domain-to-other-site' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer-to-other-site' )( {
			component: d.default,
		} )
	)
);

const domainConnectionSetupRoute = createRoute( {
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
	import( 'calypso/dashboard/domains/domain-connection-setup' ).then( ( d ) =>
		createLazyRoute( 'domain-connection-setup' )( {
			component: d.default,
		} )
	)
);

const domainTransferSetupRoute = createRoute( {
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
	import( 'calypso/dashboard/domains/domain-connection-setup/transfer-setup' ).then( ( d ) =>
		createLazyRoute( 'domain-transfer-setup' )( {
			component: d.default,
		} )
	)
);

const DummyRouteComponent = () =>
	createElement( 'div', null, createElement( 'h3', null, "it's working" ) );

const domainSiteRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '$domain/$site',
} );

const dummyRoute = createRoute( {
	getParentRoute: () => domainSiteRoute,
	path: 'dummy',
	component: DummyRouteComponent,
} );

const createRouteTree = () =>
	rootRoute.addChildren( [
		domainsListRoute,
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
			domainTransferRoute,
			domainTransferToAnyUserRoute,
			domainTransferToOtherUserRoute,
			domainTransferToOtherSiteRoute,
			domainSecurityRoute,
		] ),
		domainSiteRoute.addChildren( [ dummyRoute ] ),
	] );

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync();

export const routerConfig = {
	basePath: '/domains/manage/all/overview/v2',
};

export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	return createRouter( {
		...getRouterOptions(),
		routeTree,
		basepath: basePath,
	} );
};

export default getRouter( routerConfig );
