export type EmailProvider = 'titan' | 'google-workspace' | 'forwarding';

export interface Email {
	id: string;
	emailAddress: string;
	type: 'mailbox' | 'forwarding';
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

export async function fetchEmails(): Promise< Email[] > {
	return Promise.resolve( EMAIL_DATA );
}

export function findEmailById( id: string ): Email | undefined {
	return EMAIL_DATA.find( ( email ) => email.id === id );
}

export async function fetchEmail( id: string ): Promise< Email | undefined > {
	return Promise.resolve( findEmailById( id ) );
}
