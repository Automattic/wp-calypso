import wpcom from 'calypso/lib/wp';
import type {
	Domain,
	Email,
	MediaStorage,
	MonitorUptime,
	Plan,
	Site,
	User,
	Profile,
	TwoStep,
	EngagementStatsDataPoint,
	SiteDomain,
} from './types';

export const fetchProfile = async (): Promise< Profile > => {
	return await wpcom.req.get( {
		path: '/me/settings?http_envelope=1',
		apiNamespace: 'rest/v1.1',
	} );
};

export const updateProfile = async ( data: Partial< Profile > ) => {
	const saveableKeys = [ 'display_name', 'description', 'is_dev_account', 'user_URL' ];
	for ( const key in data ) {
		if ( ! saveableKeys.includes( key ) ) {
			delete data[ key as keyof Profile ];
		}
	}
	return await wpcom.req.post( {
		path: '/me/settings?http_envelope=1',
		apiNamespace: 'rest/v1.1',
		body: data,
	} );
};

const SITE_FIELDS = [
	'ID',
	'URL',
	'name',
	'icon',
	'subscribers_count',
	'plan',
	'active_modules',
	'is_deleted',
	'is_coming_soon',
	'is_private',
	'launch_status',
	'site_migration',
	'options',
	'site_owner',
].join( ',' );

export const fetchSites = async (): Promise< Site[] > => {
	return (
		await wpcom.req.get(
			{
				path: '/me/sites?http_envelope=1',
				apiNamespace: 'rest/v1.2',
			},
			{
				site_visibility: 'all',
				include_domain_only: 'true',
				site_activity: 'active',
				fields: SITE_FIELDS,
			}
		)
	).sites;
};

export const fetchSite = async ( id: string ): Promise< Site > => {
	if ( ! id ) {
		return Promise.reject( new Error( 'Site ID is undefined' ) );
	}
	return await wpcom.req.get(
		{
			path: `/sites/${ id }?http_envelope=1`,
			apiNamespace: 'rest/v1.1',
		},
		{ fields: SITE_FIELDS }
	);
};

export const fetchSiteMediaStorage = async ( id: string ): Promise< MediaStorage > => {
	if ( ! id ) {
		return Promise.reject( new Error( 'Site ID is undefined' ) );
	}
	const mediaStorage = await wpcom.req.get( {
		path: `/sites/${ id }/media-storage`,
		apiVersion: '1.1',
	} );
	return {
		maxStorageBytesFromAddOns: Number( mediaStorage.max_storage_bytes_from_add_ons ),
		maxStorageBytes: Number( mediaStorage.max_storage_bytes ),
		storageUsedBytes: Number( mediaStorage.storage_used_bytes ),
	};
};

export const fetchSiteMonitorUptime = async (
	id: string
): Promise< MonitorUptime | undefined > => {
	if ( ! id ) {
		return Promise.reject( new Error( 'Site ID is undefined' ) );
	}
	// TODO: check this in different contexts..
	// TODO: this and similar requests trigger multiple requests to the same endpoint
	// with different fields. How can we avoid this?
	const site = await wpcom.req.get(
		{
			path: `/sites/${ id }?http_envelope=1`,
			apiNamespace: 'rest/v1.1',
		},
		{ fields: [ 'ID', 'jetpack', 'jetpack_modules' ].join( ',' ) }
	);
	if ( ! site?.jetpack || ! site?.jetpack_modules?.includes( 'monitor' ) ) {
		return;
	}
	return wpcom.req.get(
		{
			path: `/sites/${ id }/jetpack-monitor-uptime`,
			apiNamespace: 'wpcom/v2',
		},
		{ period: '30 days' }
	);
};

export const fetchPHPVersion = async ( id: string ): Promise< string | undefined > => {
	if ( ! id ) {
		return Promise.reject( new Error( 'Site ID is undefined' ) );
	}
	const site = await wpcom.req.get(
		{
			path: `/sites/${ id }?http_envelope=1`,
			apiNamespace: 'rest/v1.1',
		},
		{ fields: [ 'ID', 'options' ].join( ',' ) }
	);
	if ( ! site.options?.is_wpcom_atomic ) {
		return;
	}
	// TODO: check request in different contexts.. Also do we show this only for atomic sites?
	// TODO: find out what check is needed before this request to avoid 403 errors.
	return wpcom.req.get( {
		path: `/sites/${ id }/hosting/php-version`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const fetchCurrentPlan = async ( id: string ): Promise< Plan > => {
	if ( ! id ) {
		return Promise.reject( new Error( 'Site ID is undefined' ) );
	}
	const plans: Record< string, Plan > = await wpcom.req.get( {
		path: `/sites/${ id }/plans`,
		apiVersion: '1.3',
	} );
	const plan = Object.values( plans ).find( ( plan ) => plan.current_plan );
	if ( ! plan ) {
		throw new Error( 'No current plan found' );
	}
	return plan;
};

export const fetchSiteEngagementStats = async ( id: string ) => {
	if ( ! id ) {
		return Promise.reject( new Error( 'Site ID is undefined' ) );
	}

	const response = await wpcom.req.get(
		{ path: `/sites/${ id }/stats/visits` },
		{
			unit: 'day',
			quantity: 14,
			stat_fields: [ 'visitors', 'views', 'likes', 'comments' ].join( ',' ),
		}
	);
	// We need to normalize the returned data. We ask for 14 days of data (quantity:14)
	// and we get a response with an array of data like: `[ '2025-04-13', 1, 3, 0, 0 ]`.
	// Each number in the response is referring to the order of the field provided in `stat_fields`.
	// The returend array is sorted with ascending date order, so we need to use the last 7 entries
	// for our current data and the first 7 entries for the previous data.
	// Noting that we can't use `unit:'week'` because the API has a specific behavior for start/end of weeks.
	const calculateStats = ( data: Array< [ string, number, number, number, number ] > ) =>
		data.reduce(
			( accumulator: EngagementStatsDataPoint, [ , visitors, views, likes, comments ] ) => {
				accumulator.visitors += Number( visitors );
				accumulator.views += Number( views );
				accumulator.likes += Number( likes );
				accumulator.comments += Number( comments );
				return accumulator;
			},
			{ visitors: 0, views: 0, likes: 0, comments: 0 }
		);
	const dataLength = response.data.length;
	const currentData = calculateStats( response.data.slice( Math.max( 0, dataLength - 7 ) ) );
	const previousData = calculateStats( response.data.slice( 0, Math.max( 0, dataLength - 7 ) ) );
	return { previousData, currentData };
};

export const fetchDomains = async (): Promise< Domain[] > => {
	return (
		await wpcom.req.get(
			{ path: '/all-domains?http_envelope=1' },
			{
				no_wpcom: true,
				resolve_status: true,
			}
		)
	).domains;
};

export const fetchSiteDomains = async ( id: string ): Promise< { domains: SiteDomain[] } > => {
	try {
		const domains = await wpcom.req.get(
			{ path: `/sites/${ id }/domains` },
			{ apiVersion: '1.2' }
		);
		return domains;
	} catch ( error ) {
		// TODO: check how to properly fetch for all sites..
		return { domains: [] };
	}
};

export const fetchSitePrimaryDomain = async ( id: string ): Promise< SiteDomain | undefined > => {
	const { domains } = await fetchSiteDomains( id );
	return domains.find( ( domain: SiteDomain ) => domain.primary_domain );
};

export const EMAIL_DATA: Email[] = [
	{
		id: '1',
		emailAddress: 'info@example.com',
		type: 'mailbox',
		provider: 'titan',
		providerDisplayName: 'Titan Mail',
		domainName: 'example.com',
		siteId: '2',
		siteName: 'Business Site',
		storageUsed: 235,
		storageLimit: 10240,
		createdDate: '2022-06-15',
		status: 'active',
	},
	{
		id: '2',
		emailAddress: 'support@example.com',
		type: 'mailbox',
		provider: 'titan',
		providerDisplayName: 'Titan Mail',
		domainName: 'example.com',
		siteId: '2',
		siteName: 'Business Site',
		storageUsed: 1560,
		storageLimit: 10240,
		createdDate: '2022-06-15',
		status: 'active',
	},
	{
		id: '3',
		emailAddress: 'billing@mybusiness.store',
		type: 'mailbox',
		provider: 'google-workspace',
		providerDisplayName: 'Google Workspace',
		domainName: 'mybusiness.store',
		siteId: '2',
		siteName: 'Business Site',
		storageUsed: 3200,
		storageLimit: 30720,
		createdDate: '2023-01-25',
		status: 'active',
	},
	{
		id: '4',
		emailAddress: 'contact@creative-portfolio.design',
		type: 'forwarding',
		provider: 'forwarding',
		providerDisplayName: 'Email Forwarding',
		domainName: 'creative-portfolio.design',
		siteId: '3',
		siteName: 'Portfolio',
		forwardingTo: 'myname@gmail.com',
		createdDate: '2022-11-15',
		status: 'active',
	},
	{
		id: '5',
		emailAddress: 'jobs@mybusiness.store',
		type: 'forwarding',
		provider: 'forwarding',
		providerDisplayName: 'Email Forwarding',
		domainName: 'mybusiness.store',
		siteId: '2',
		siteName: 'Business Site',
		forwardingTo: 'career@mybusiness.com',
		createdDate: '2023-02-10',
		status: 'active',
	},
	{
		id: '6',
		emailAddress: 'newsletter@myblog.com',
		type: 'forwarding',
		provider: 'forwarding',
		providerDisplayName: 'Email Forwarding',
		domainName: 'myblog.com',
		siteId: '1',
		siteName: 'My Blog',
		forwardingTo: 'myblog-newsletter@gmail.com',
		createdDate: '2022-08-05',
		status: 'active',
	},
	{
		id: '7',
		emailAddress: 'admin@mybusiness.store',
		type: 'mailbox',
		provider: 'google-workspace',
		providerDisplayName: 'Google Workspace',
		domainName: 'mybusiness.store',
		siteId: '2',
		siteName: 'Business Site',
		storageUsed: 5685,
		storageLimit: 30720,
		createdDate: '2023-01-25',
		status: 'active',
	},
	{
		id: '8',
		emailAddress: 'team@example.com',
		type: 'mailbox',
		provider: 'titan',
		providerDisplayName: 'Titan Mail',
		domainName: 'example.com',
		siteId: '2',
		siteName: 'Business Site',
		storageUsed: 4250,
		storageLimit: 10240,
		createdDate: '2022-06-18',
		status: 'active',
	},
];

export const fetchEmails = (): Promise< Email[] > => {
	return Promise.resolve( EMAIL_DATA );
};

export const findEmailById = ( id: string ): Email | undefined => {
	return EMAIL_DATA.find( ( email ) => email.id === id );
};

export const fetchEmail = ( id: string ): Promise< Email | undefined > => {
	return Promise.resolve( findEmailById( id ) );
};

export const fetchUser = async (): Promise< User > => {
	return await wpcom.me().get();
};

export const fetchTwoStep = async (): Promise< TwoStep > => {
	return wpcom.req.get( {
		path: '/me/two-step?http_envelope=1',
		apiNamespace: 'rest/v1.1',
	} );
};
