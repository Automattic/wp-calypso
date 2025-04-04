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

export type SiteObject = {
	id: string;
	title: string;
	url: string;
	visitors: number;
	performance: number;
	backups: boolean;
	protect: boolean;
};

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

export const SITE_DATA: SiteObject[] = [
	{
		id: '1',
		title: 'My Blog',
		url: 'https://myblog.com',
		visitors: 2547,
		performance: 92,
		backups: true,
		protect: false,
	},
	{
		id: '2',
		title: 'Business Site',
		url: 'https://mybusiness.com',
		visitors: 5324,
		performance: 87,
		backups: true,
		protect: true,
	},
	{
		id: '3',
		title: 'Portfolio',
		url: 'https://myportfolio.com',
		visitors: 1867,
		performance: 95,
		backups: false,
		protect: false,
	},
];

export const findItemById = ( id: string ): SiteObject | undefined => {
	return SITE_DATA.find( ( site ) => site.id === id );
};

export const fetchSites = (): Promise< SiteObject[] > => {
	return Promise.resolve( SITE_DATA );
};

export const fetchSite = ( id: string ): Promise< SiteObject | undefined > => {
	return Promise.resolve( findItemById( id ) );
};

export const fetchDomains = (): Promise< Domain[] > => {
	return Promise.resolve( mockDomains );
};

/**
 * Site interface
 */
export interface Site {
	id: number;
	name: string;
	url?: string;
}

/**
 * Mock sites data
 */
export const sites: Record< number, Site > = {
	1: { id: 1, name: 'Example Site', url: 'https://example.com' },
	2: { id: 2, name: 'My Blog', url: 'https://myblog.com' },
	3: { id: 3, name: 'Test Site', url: 'https://testdomain.net' },
	4: { id: 4, name: 'Another Site', url: 'https://anotherdomain.org' },
	5: { id: 5, name: 'WordPress Blog', url: 'https://wordpress-site.com' },
};
