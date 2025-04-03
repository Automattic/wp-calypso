export const SITE_DATA = [
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

export type Site = {
	id: string;
	title: string;
	url: string;
	visitors: number;
	performance: number;
	backups: boolean;
	protect: boolean;
};

export const findItemById = ( id: string | undefined ): Site | undefined => {
	return SITE_DATA.find( ( site ) => site.id === id );
};
