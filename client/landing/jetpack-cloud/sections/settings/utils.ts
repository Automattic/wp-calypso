export const featuredProviders = [
	{ id: 'bluehost', name: 'Bluehost' },
	{
		id: 'siteground',
		name: 'SiteGround',
	},
	{ id: 'amazon', name: 'Amazon / AWS' },
	{ id: 'dreamhost', name: 'Dreamhost' },
	{ id: 'godaddy', name: 'GoDaddy' },
	{ id: 'hostgator', name: 'HostGator' },
	{
		id: 'pressable',
		name: 'Pressable',
	},
];

export const getProviderNameFromId = ( searchId: string ) => {
	for ( const { id, name } of featuredProviders ) {
		if ( id === searchId ) {
			return name;
		}
	}

	return null;
};
