import wpcom from 'calypso/lib/wp';
import type {
	User,
	Domain,
	Site,
	SiteOptions,
	Plan,
	SitePlan,
	Email,
	TwoStep,
	MediaStorageObject,
	MonitorUptimeAPIResponse,
} from './types';

export const fetchProfile = () =>
	wpcom.req.get( {
		path: '/me/settings?http_envelope=1',
		apiNamespace: 'rest/v1.1',
	} ) as Promise< User >;

export const updateProfile = ( data: User ) =>
	wpcom.req.post( {
		path: '/me/settings',
		apiNamespace: 'rest/v1.1',
		body: {
			display_name: data.display_name,
			description: data.description,
		},
	} );

const mockDomains: Domain[] = [
	{
		id: 1,
		domain: 'example.com',
		blog_id: 1,
		owner: 'User One',
		expiry: '2025-12-31',
		domain_status: { status: 'Active' },
		wpcom_domain: false,
		sslStatus: 'Active',
		domain_type: 'Registered',
	},
	{
		id: 2,
		domain: 'myblog.com',
		blog_id: 2,
		owner: 'User Two',
		expiry: '2026-10-15',
		domain_status: { status: 'Active' },
		wpcom_domain: false,
		sslStatus: 'Active',
		domain_type: 'Registered',
	},
	{
		id: 3,
		domain: 'testdomain.net',
		blog_id: 3,
		owner: 'User Three',
		expiry: '2025-05-22',
		domain_status: { status: 'Expiring' },
		wpcom_domain: false,
		sslStatus: 'Inactive',
		domain_type: 'Registered',
	},
	{
		id: 4,
		domain: 'anotherdomain.org',
		blog_id: 4,
		owner: 'User Four',
		expiry: '2026-02-10',
		domain_status: { status: 'Pending Transfer' },
		wpcom_domain: false,
		sslStatus: 'Pending',
		domain_type: 'Registered',
	},
	{
		id: 5,
		domain: 'wordpress-site.com',
		blog_id: 5,
		owner: 'User Five',
		expiry: '2027-01-05',
		domain_status: { status: 'Active' },
		wpcom_domain: false,
		sslStatus: 'Active',
		domain_type: 'Registered',
	},
	{
		id: 6,
		domain: 'example-blog.wordpress.com',
		blog_id: 1,
		owner: 'User One',
		expiry: 'N/A',
		domain_status: { status: 'Active' },
		wpcom_domain: true,
		sslStatus: 'Active',
		domain_type: 'Free',
	},
	{
		id: 7,
		domain: 'premium-site.blog',
		blog_id: 2,
		owner: 'User Two',
		expiry: '2026-04-18',
		domain_status: { status: 'Active' },
		wpcom_domain: false,
		sslStatus: 'Active',
		domain_type: 'Premium',
	},
];

interface WPCOMRESTAPISite {
	ID: string;
	name: string;
	URL: string;
	icon: {
		ico: string;
	};
	plan: SitePlan;
	active_modules: string[];
	subscribers_count: number;
	options: SiteOptions;
	is_deleted: boolean;
}

const siteRequestObjectToSiteObject = ( site: WPCOMRESTAPISite ): Site => ( {
	id: site.ID,
	name: site.name,
	url: site.URL,
	media: site.icon?.ico,
	backups: site.plan?.features?.active?.includes( 'backups' ) ? 'enabled' : 'disabled',
	protect: site.active_modules?.includes( 'protect' ) ? 'enabled' : 'disabled',
	subscribers: site.subscribers_count,
	plan: site.plan,
	options: {
		software_version: site.options?.software_version,
		admin_url: site.options?.admin_url,
		is_wpcom_atomic: site.options?.is_wpcom_atomic,
	},
	is_deleted: site.is_deleted,
} );

export const fetchSites = (): Promise< Site[] > => {
	return wpcom.req
		.get( {
			path: '/me/sites?http_envelope=1&site_visibility=all&include_domain_only=true&site_activity=active&fields=ID,URL,name,icon,subscribers_count,plan,active_modules,is_deleted,options',
			apiNamespace: 'rest/v1.2',
		} )
		.then( ( response: { sites: WPCOMRESTAPISite[] } ) => {
			return response.sites.map( siteRequestObjectToSiteObject );
		} );
};

export const fetchSite = async ( id: string ): Promise< Site > => {
	if ( ! id ) {
		return Promise.reject( new Error( 'Site ID is undefined' ) );
	}
	const site = await wpcom.req.get( {
		path: `/sites/${ id }?http_envelope=1&fields=ID,URL,name,icon,subscribers_count,plan,active_modules,options`,
		apiNamespace: 'rest/v1.1',
	} );
	return siteRequestObjectToSiteObject( site );
};

export const fetchSiteMediaStorage = async ( id: string ): Promise< MediaStorageObject > => {
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
): Promise< MonitorUptimeAPIResponse | undefined > => {
	if ( ! id ) {
		return Promise.reject( new Error( 'Site ID is undefined' ) );
	}
	// TODO: check this in different contexts..
	// TODO: this and similar requests trigger multiple requests to the same endpoint
	// with different fields. How can we avoid this?
	const site = await wpcom.req.get( {
		path: `/sites/${ id }?http_envelope=1&fields=ID,jetpack,jetpack_modules`,
		apiNamespace: 'rest/v1.1',
	} );
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
	const site = await wpcom.req.get( {
		path: `/sites/${ id }?http_envelope=1&fields=ID,options`,
		apiNamespace: 'rest/v1.1',
	} );
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
	const plans = await wpcom.req.get( {
		path: `/sites/${ id }/plans`,
		apiVersion: '1.3',
	} );
	return Object.values( plans ).find( ( plan: Plan ) => plan.current_plan );
};

export const fetchDomains = (): Promise< Domain[] > => {
	return Promise.resolve( mockDomains );
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
		path: '/me/two-step/?http_envelope=1',
		apiNamespace: 'rest/v1.1',
	} ) as Promise< TwoStep >;
};
