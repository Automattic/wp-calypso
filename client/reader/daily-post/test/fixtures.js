
const dailyPostSiteId = 489937;

export const basicPost = {
	site_ID: 1,
	tags: {}
};

export const dailyPostSitePost = {
	site_ID: dailyPostSiteId,
	type: 'post'
};

export const dailyPromptPost = {
	site_ID: dailyPostSiteId,
	tags: {
		'daily prompts': {
			slug: 'daily-prompts-2',
		},
	},
	type: 'dp_prompt',
	title: 'Crisis',
	URL: 'https://dailypost.wordpress.com/2016/07/27/crisis/',
	short_url: 'http://wp.me/p23sd-12Mf'
};

export const photoChallengePost = {
	site_ID: dailyPostSiteId,
	type: 'dp_photo_challenge'
};

export const discoverChallengePost = {
	site_ID: dailyPostSiteId,
	type: 'dp_discover'
};

export const sitesList = [
	{ ID: 108516984, name: 'Join the Narwhal Club' },
	{ ID: 6200060, name: '"I expected:"' },
	{ ID: 72386110, name: 'Calypso Project P2' }
];
