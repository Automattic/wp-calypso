import wpcom from 'calypso/lib/wp';
import type { LoaderFunctionArgs } from 'react-router-dom';

export interface ProfileObject {
	user_login: string;
	display_name: string;
	user_email: string;
	user_URL: string;
	description: string;
	isDeveloper: boolean;
	avatar_URL: string;
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

export const fetchSite = ( { params }: LoaderFunctionArgs ): Promise< SiteData > => {
	return wpcom.req.get( {
		path: `/sites/${ params.id }?http_envelope=1`,
		apiNamespace: 'rest/v1.1',
	} );
};

export const fetchDomains = (): Promise< Domain[] > => {
	return Promise.resolve( mockDomains );
};

export type EmailType = 'mailbox' | 'forwarding';
export type EmailProvider = 'titan' | 'google-workspace' | 'forwarding';
export type EmailProviderDisplay = {
	id: EmailProvider;
	displayName: string;
};

export interface EmailObject {
	id: string;
	emailAddress: string;
	type: EmailType;
	provider: EmailProvider;
	providerDisplayName: string;
	domainName: string;
	siteId?: string;
	siteName?: string;
	forwardingTo?: string;
	storageUsed?: number;
	storageLimit?: number;
	createdDate: string;
	status: 'active' | 'pending' | 'suspended';
}

export const EMAIL_DATA: EmailObject[] = [
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

export const fetchEmails = (): Promise< EmailObject[] > => {
	return Promise.resolve( EMAIL_DATA );
};

export const findEmailById = ( id: string ): EmailObject | undefined => {
	return EMAIL_DATA.find( ( email ) => email.id === id );
};

export const fetchEmail = ( id: string ): Promise< EmailObject | undefined > => {
	return Promise.resolve( findEmailById( id ) );
};
