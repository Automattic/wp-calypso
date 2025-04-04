import wpcom from 'calypso/lib/wp';

export interface ProfileObject {
	user_login: string;
	display_name: string;
	user_email: string;
	user_URL: string;
	description: string;
	isDeveloper: boolean;
}

export const fetchProfile = () =>
	wpcom.req.get( {
		path: '/me/settings?http_envelope=1',
		apiNamespace: 'rest/v1.1',
	} ) as Promise< ProfileObject >;

export const updateProfile = ( data: ProfileObject ) =>
	wpcom.req.post( {
		path: '/me/settings',
		apiNamespace: 'rest/v1.1',
		body: {
			display_name: data.display_name,
			description: data.description,
		},
	} );

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Domain interface
 */
export interface Domain {
	id: number;
	domain: string;
	blog_id: number;
	owner: string;
	expiry: string;
	domain_status: {
		status: string;
	};
	wpcom_domain: boolean;
	sslStatus: string;
	domain_type: string;
}

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

export type SiteData = {
	ID: string;
	name: string;
	url: string;
	icon: {
		ico: string;
	};
	// visitors: number;
	// performance: number;
	// backups: boolean;
	// protect: boolean;
};

export type SitesRequest = {
	sites: SiteData[];
};

export const fetchSites = (): Promise< SiteData[] > => {
	return wpcom.req.get( {
		path: '/me/sites?http_envelope=1&site_visibility=all&include_domain_only=true&site_activity=active&fields=ID,URL,name,icon,subscribers_count',
		apiNamespace: 'rest/v1.2',
	} );
};

export const fetchSite = ( id: string ): Promise< SiteData | undefined > => {
	return wpcom.req.get( {
		path: `/sites/${ id }`,
		apiNamespace: 'rest/v1.1',
	} );
};

export const fetchDomains = (): Promise< Domain[] > => {
	return Promise.resolve( mockDomains );
};
