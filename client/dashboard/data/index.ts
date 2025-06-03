import wpcom from 'calypso/lib/wp';
import { SITE_FIELDS, SITE_OPTIONS } from './constants';
import type {
	Domain,
	Email,
	MediaStorage,
	MonitorUptime,
	Plan,
	Site,
	AgencyBlog,
	Purchase,
	User,
	SiteUser,
	Profile,
	TwoStep,
	EngagementStatsDataPoint,
	BasicMetricsData,
	SiteSettings,
	UrlPerformanceInsights,
	SiteResetContentSummary,
	SiteResetStatus,
	PhpMyAdminToken,
	DefensiveModeSettings,
	DefensiveModeSettingsUpdate,
	SiteTransferConfirmation,
} from './types';
import type { DataCenterOption } from 'calypso/data/data-center/types';

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

const JOINED_SITE_FIELDS = SITE_FIELDS.join( ',' );
const JOINED_SITE_OPTIONS = SITE_OPTIONS.join( ',' );

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
			fields: JOINED_SITE_FIELDS,
			options: JOINED_SITE_OPTIONS,
		}
	);
	return sites;
};

export const fetchSite = async ( siteIdOrSlug: string ): Promise< Site > => {
	return await wpcom.req.get(
		{ path: `/sites/${ siteIdOrSlug }` },
		{ fields: JOINED_SITE_FIELDS, options: JOINED_SITE_OPTIONS }
	);
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
	return wpcom.req.get( {
		path: `/sites/${ id }/hosting/php-version`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const updatePHPVersion = async (
	siteIdOrSlug: string,
	version: string
): Promise< void > => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/hosting/php-version`,
			apiNamespace: 'wpcom/v2',
		},
		{ version }
	);
};

export const fetchWordPressVersion = async ( siteIdOrSlug: string ): Promise< string > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/hosting/wp-version`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const updateWordPressVersion = async (
	siteIdOrSlug: string,
	version: string
): Promise< void > => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/hosting/wp-version`,
			apiNamespace: 'wpcom/v2',
		},
		{ version }
	);
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

export const fetchSiteSettings = async ( siteIdOrSlug: string ): Promise< SiteSettings > => {
	const { settings } = await wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/settings`,
		apiVersion: '1.4',
	} );
	return fromRawSiteSettings( settings );
};

export const updateSiteSettings = async ( siteIdOrSlug: string, data: Partial< SiteSettings > ) => {
	const { updated } = await wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/settings`,
			apiVersion: '1.4',
		},
		toRawSiteSettings( data )
	);
	return fromRawSiteSettings( updated );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRawSiteSettings( rawSettings: any ): SiteSettings {
	// Pluck out raw settings which don't map directly to a field in SiteSettings.
	const {
		blog_public: blogPublicRaw,
		wpcom_coming_soon: wpcomComingSoonRaw,
		wpcom_public_coming_soon: wpcomPublicComingSoonRaw,
		wpcom_data_sharing_opt_out: wpcomDataSharingOptOutRaw,
		...settings
	} = rawSettings;

	const blog_public = Number( blogPublicRaw );
	const wpcom_coming_soon = Number( wpcomComingSoonRaw );
	const wpcom_public_coming_soon = Number( wpcomPublicComingSoonRaw );
	const wpcom_data_sharing_opt_out = Boolean( wpcomDataSharingOptOutRaw );

	if ( wpcom_coming_soon === 1 || wpcom_public_coming_soon === 1 ) {
		settings.wpcom_site_visibility = 'coming-soon';
		settings.wpcom_discourage_search_engines = false;
	} else if ( blog_public === -1 ) {
		settings.wpcom_site_visibility = 'private';
		settings.wpcom_discourage_search_engines = false;
	} else {
		settings.wpcom_site_visibility = 'public';
		settings.wpcom_discourage_search_engines = blog_public === 0;
	}

	settings.wpcom_prevent_third_party_sharing = wpcom_data_sharing_opt_out;

	return settings;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRawSiteSettings( settings: Partial< SiteSettings > ): any {
	// Pluck out settings which don't map directly to a field in the raw settings.
	const {
		wpcom_site_visibility,
		wpcom_discourage_search_engines,
		wpcom_prevent_third_party_sharing,
		...rest
	} = settings;
	const rawSettings = rest as any; // eslint-disable-line @typescript-eslint/no-explicit-any

	if ( wpcom_site_visibility !== undefined ) {
		if ( wpcom_site_visibility === 'coming-soon' ) {
			rawSettings.blog_public = 0;
			rawSettings.wpcom_public_coming_soon = 1;
			rawSettings.wpcom_data_sharing_opt_out = false;
		} else if ( wpcom_site_visibility === 'private' ) {
			rawSettings.blog_public = -1;
			rawSettings.wpcom_public_coming_soon = 0;
			rawSettings.wpcom_data_sharing_opt_out = false;
		} else {
			rawSettings.blog_public = wpcom_discourage_search_engines ? 0 : 1;
			rawSettings.wpcom_public_coming_soon = 0;
			rawSettings.wpcom_data_sharing_opt_out = wpcom_prevent_third_party_sharing;
		}

		// Take opportunity, while the user is switching visibility settings, to disable the legacy coming soon setting.
		rawSettings.wpcom_coming_soon = 0;
	}

	return rawSettings;
}

export const restoreSitePlanSoftware = async ( siteIdOrSlug: string ) => {
	return wpcom.req.post( {
		path: `/sites/${ siteIdOrSlug }/hosting/restore-plan-software`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const siteOwnerTransfer = async (
	siteIdOrSlug: string,
	data: { new_site_owner: string }
) => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/site-owner-transfer`,
			apiNamespace: 'wpcom/v2',
		},
		{
			calypso_origin: window.location.origin,
		},
		{
			context: 'dashboard_v2',
			...data,
		}
	);
};

export const siteOwnerTransferEligibilityCheck = async (
	siteIdOrSlug: string,
	data: { new_site_owner: string }
) => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/site-owner-transfer/eligibility`,
			apiNamespace: 'wpcom/v2',
		},
		data
	);
};

export const siteOwnerTransferConfirm = async (
	siteIdOrSlug: string,
	data: { hash: string }
): Promise< SiteTransferConfirmation > => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/site-owner-transfer/confirm`,
			apiNamespace: 'wpcom/v2',
		},
		data
	);
};

export const deleteSite = async ( siteIdOrSlug: string ) => {
	return wpcom.req.post( {
		path: `/sites/${ siteIdOrSlug }/delete`,
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

export const fetchPhpMyAdminToken = async ( siteIdOrSlug: string ): Promise< PhpMyAdminToken > => {
	return wpcom.req.post( {
		path: `/sites/${ siteIdOrSlug }/hosting/pma/token`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const resetPhpMyAdminPassword = async ( siteIdOrSlug: string ): Promise< void > => {
	return wpcom.req.post( {
		path: `/sites/${ siteIdOrSlug }/hosting/restore-database-password`,
		apiNamespace: 'wpcom/v2',
	} );
};

// This endpoint only accepts site ID, not slug.
export const fetchAgencyBlogBySiteId = async ( siteId: string ): Promise< AgencyBlog > => {
	return wpcom.req.get( {
		path: `/agency/blog/${ siteId }`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const fetchPrimaryDataCenter = async (
	siteIdOrSlug: string
): Promise< DataCenterOption | null > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/hosting/geo-affinity`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const fetchStaticFile404 = async ( siteIdOrSlug: string ): Promise< string > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/hosting/static-file-404`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const updateStaticFile404 = async (
	siteIdOrSlug: string,
	setting: string
): Promise< void > => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/hosting/static-file-404`,
			apiNamespace: 'wpcom/v2',
		},
		{ setting }
	);
};

export const clearObjectCache = async ( siteIdOrSlug: string, reason: string ): Promise< void > => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/hosting/clear-cache`,
			apiNamespace: 'wpcom/v2',
		},
		{ reason }
	);
};

export const fetchEdgeCacheStatus = async ( siteIdOrSlug: string ): Promise< boolean > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/hosting/edge-cache/active`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const updateEdgeCacheStatus = async (
	siteIdOrSlug: string,
	active: boolean
): Promise< boolean > => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/hosting/edge-cache/active`,
			apiNamespace: 'wpcom/v2',
		},
		{ active }
	);
};

export const clearEdgeCache = async ( siteIdOrSlug: string ): Promise< void > => {
	return wpcom.req.post( {
		path: `/sites/${ siteIdOrSlug }/hosting/edge-cache/purge`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const fetchEdgeCacheDefensiveMode = async (
	siteIdOrSlug: string
): Promise< DefensiveModeSettings > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/hosting/edge-cache/defensive-mode`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const updateEdgeCacheDefensiveMode = async (
	siteIdOrSlug: string,
	data: DefensiveModeSettingsUpdate
): Promise< DefensiveModeSettings > => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdOrSlug }/hosting/edge-cache/defensive-mode`,
			apiNamespace: 'wpcom/v2',
		},
		data
	);
};

export const fetchPurchases = async ( siteIdOrSlug: string ): Promise< Purchase[] > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/purchases`,
	} );
};

export const fetchSiteUserMe = async ( siteIdOrSlug: string ): Promise< SiteUser > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/users/me`,
		apiNamespace: 'wp/v2',
	} );
};

export const leaveSite = async ( siteIdOrSlug: string, userId: number ) => {
	return wpcom.req.post( {
		path: `/sites/${ siteIdOrSlug }/users/${ userId }/delete`,
	} );
};

export const fetchP2HubP2s = async (
	siteId: string,
	options: { limit?: number } = {}
): Promise< { totalItems: number } > => {
	return wpcom.req.get(
		{
			path: '/p2/workspace/sites/all',
			apiNamespace: 'wpcom/v2',
		},
		{
			hub_id: siteId,
			...options,
		}
	);
};

export const fetchSiteResetContentSummary = async (
	siteIdOrSlug: string
): Promise< SiteResetContentSummary > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/reset-site/content-summary`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const resetSite = async ( siteIdOrSlug: string ): Promise< void > => {
	return wpcom.req.post( {
		path: `/sites/${ siteIdOrSlug }/reset-site`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const fetchSiteResetStatus = async ( siteIdOrSlug: string ): Promise< SiteResetStatus > => {
	return wpcom.req.get( {
		path: `/sites/${ siteIdOrSlug }/reset-site/status`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const launchSite = async ( siteId: string ): Promise< void > => {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/launch`,
		apiNamespace: 'wpcom/v2',
	} );
};
