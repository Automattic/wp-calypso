/**
 * Verticals related to dotblog subdomains
 */
export const verticalsMap = {
	art: 'p60',
	poetry: 'p311',
	movie: 'p274a1',
	music: 'p275',
	car: 'p99',
	business: 'p94',
	school: 'p3v1',
	family: 'p160',
	health: 'p201',
	fitness: 'p172a1',
	food: 'p23',
	photo: 'p29',
	game: 'p185',
	home: 'p25',
	law: 'p238',
	politics: 'p313',
	news: 'p281',
	finance: 'p172',
	science: 'p348',
	sport: 'p371',
	fashion: 'p19',
	tech: 'p383',
	code: 'p108a1',
	video: 'p399',
	travel: 'p34',
};

/**
 * Find the vertical id with the dotblog subdomain name
 *
 * @param {string} subdomainName Dotblog subdomain excluding `.blog`. i.e. tech
 * @returns {string} vertical ID if exist. Otherwise, empty string
 */
export const getDotBlogVerticalId = ( subdomainName ) => {
	const lowercased = String( subdomainName || '' ).toLowerCase();
	return verticalsMap[ lowercased ] || '';
};
