import wpcom from 'calypso/lib/wp';

export interface ProfileObject {
	username: string;
	displayName: string;
	email: string;
	siteAddress: string;
	aboutMe: string;
	isDeveloper: boolean;
}

export const fetchProfile = () =>
	wpcom.req.get( {
		path: '/me?http_envelope=1',
		apiNamespace: 'rest/v1.1',
	} ) as Promise< ProfileObject >;

export type SiteObject = {
	id: string;
	title: string;
	url: string;
	visitors: number;
	performance: number;
	backups: boolean;
	protect: boolean;
};

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
