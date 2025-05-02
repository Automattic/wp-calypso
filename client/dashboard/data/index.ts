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
	BasicMetricsData,
	SiteSettings,
	UrlPerformanceInsights,
} from './types';

export const fetchProfile = async (): Promise< Profile > => {
	return await wpcom.req.get( '/me/settings' );
};

export const updateProfile = async ( data: Partial< Profile > ) => {
	const saveableKeys = [ 'display_name', 'description', 'is_dev_account', 'user_URL' ];
	for ( const key in data ) {
		if ( ! saveableKeys.includes( key ) ) {
			delete data[ key as keyof Profile ];
		}
	}
	return await wpcom.req.post( '/me/settings', data );
};

const SITE_FIELDS = [
	'ID',
	'slug',
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
	'jetpack',
	'jetpack_modules',
].join( ',' );

export const fetchSites = async (): Promise< Site[] > => {
	const { sites } = await wpcom.req.get(
		{
			path: '/me/sites',
			apiVersion: '1.2',
		},
		{
			site_visibility: 'all',
			include_domain_only: 'true',
			site_activity: 'active',
			fields: SITE_FIELDS,
		}
	);
	return sites;
};

export const fetchSite = async ( siteIdOrSlug: string ): Promise< Site > => {
	return await wpcom.req.get( { path: `/sites/${ siteIdOrSlug }` }, { fields: SITE_FIELDS } );
};

export const fetchSiteMediaStorage = async ( siteIdOrSlug: string ): Promise< MediaStorage > => {
	const mediaStorage = await wpcom.req.get( `/sites/${ siteIdOrSlug }/media-storage` );
	return {
		maxStorageBytesFromAddOns: Number( mediaStorage.max_storage_bytes_from_add_ons ),
		maxStorageBytes: Number( mediaStorage.max_storage_bytes ),
		storageUsedBytes: Number( mediaStorage.storage_used_bytes ),
	};
};

export const fetchSiteMonitorUptime = async (
	id: string
): Promise< MonitorUptime | undefined > => {
	return wpcom.req.get(
		{
			path: `/sites/${ id }/jetpack-monitor-uptime`,
			apiNamespace: 'wpcom/v2',
		},
		{ period: '30 days' }
	);
};

export const fetchPHPVersion = async ( id: string ): Promise< string | undefined > => {
	// TODO: check request in different contexts.. Also do we show this only for atomic sites?
	// TODO: find out what check is needed before this request to avoid 403 errors.
	return wpcom.req.get( {
		path: `/sites/${ id }/hosting/php-version`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const fetchCurrentPlan = async ( siteIdOrSlug: string ): Promise< Plan > => {
	const plans: Record< string, Plan > = await wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/plans`,
		apiVersion: '1.3',
	} );
	const plan = Object.values( plans ).find( ( plan ) => plan.current_plan );
	if ( ! plan ) {
		throw new Error( 'No current plan found' );
	}
	return plan;
};

export const fetchSiteEngagementStats = async ( siteIdOrSlug: string ) => {
	const response = await wpcom.req.get( `/sites/${ siteIdOrSlug }/stats/visits`, {
		unit: 'day',
		quantity: 14,
		stat_fields: [ 'visitors', 'views', 'likes', 'comments' ].join( ',' ),
	} );
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
	return ( await wpcom.req.get( '/all-domains', { no_wpcom: true, resolve_status: true } ) )
		.domains;
};

export const fetchSiteDomains = async ( id: string ): Promise< { domains: SiteDomain[] } > => {
	try {
		const domains = await wpcom.req.get( { path: `/sites/${ id }/domains`, apiVersion: '1.2' } );
		return domains;
	} catch ( error ) {
		// TODO: check how to properly fetch for all sites..
		return { domains: [] };
	}
};

export const fetchSitePrimaryDomain = async (
	siteIdOrSlug: string
): Promise< SiteDomain | undefined > => {
	const { domains } = await fetchSiteDomains( siteIdOrSlug );
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
	return wpcom.req.get( '/me' );
};

export const fetchTwoStep = async (): Promise< TwoStep > => {
	return wpcom.req.get( '/me/two-step' );
};

export const fetchSiteSettings = async ( id: string ): Promise< SiteSettings > => {
	return wpcom.req.get( {
		path: `/sites/${ id }/settings`,
		apiVersion: '1.4',
	} );
};

export const fetchBasicMetrics = async ( url: string ): Promise< BasicMetricsData > => {
	return wpcom.req.get(
		{
			path: '/site-profiler/metrics/basic',
			apiNamespace: 'wpcom/v2',
		},
		// Important: advance=1 is needed to get the `token` and request advanced metrics.
		{ url, advance: '1' }
	);
};

export const fetchPerformanceInsights = async (
	url: string,
	token: string
): Promise< UrlPerformanceInsights > => {
	return wpcom.req.get(
		{
			path: '/site-profiler/metrics/advanced/insights',
			apiNamespace: 'wpcom/v2',
		},
		{ url, advance: '1', hash: token }
	);
};
