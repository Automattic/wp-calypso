export interface FediAccount {
	username: string;
	instance: string;
	displayName: string;
	bio: string;
	avatarUrl: string;
	feedUrl?: string;
}

export interface StarterPack {
	slug: string;
	title: string;
	description: string;
	accounts: FediAccount[];
}

export const starterPacks: StarterPack[] = [
	{
		slug: 'wordpress-community',
		title: 'WordPress Community',
		description:
			'Key voices from the WordPress community — core contributors, plugin developers, and community organizers.',
		accounts: [
			{
				username: 'matt',
				instance: 'ma.tt',
				displayName: 'Matt Mullenweg',
				bio: 'Working on WordPress and Tumblr.',
				avatarUrl: 'https://ma.tt/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=mm&r=g',
				feedUrl: 'https://ma.tt/@matt.rss',
			},
			{
				username: 'pfefferle',
				instance: 'mastodon.social',
				displayName: 'Matthias Pfefferle',
				bio: 'WordPress Core Contributor. Working on ActivityPub, Webmention, and IndieWeb plugins.',
				avatarUrl:
					'https://files.mastodon.social/accounts/avatars/000/023/634/original/1cc8e945ef4cecfc.jpg',
				feedUrl: 'https://mastodon.social/@pfefferle.rss',
			},
			{
				username: 'WordPress',
				instance: 'mastodon.social',
				displayName: 'WordPress',
				bio: 'The official WordPress Mastodon account. Democratizing publishing, one blog at a time.',
				avatarUrl:
					'https://files.mastodon.social/accounts/avatars/110/349/077/671/596/498/original/06b09ebfa32dbe89.png',
				feedUrl: 'https://mastodon.social/@WordPress.rss',
			},
			{
				username: 'wordpress',
				instance: 'floss.social',
				displayName: 'WordPress Community',
				bio: 'WordPress community on FLOSS Social.',
				avatarUrl:
					'https://cdn.floss.social/accounts/avatars/109/310/827/479/614/940/original/e3ccff3ca6d4b21e.png',
				feedUrl: 'https://floss.social/@wordpress.rss',
			},
		],
	},
	{
		slug: 'fediverse-developers',
		title: 'Fediverse Developers',
		description:
			'Developers building the Fediverse — working on ActivityPub, Mastodon, and decentralized social protocols.',
		accounts: [
			{
				username: 'Gargron',
				instance: 'mastodon.social',
				displayName: 'Eugen Rochko',
				bio: 'Founder and CEO of Mastodon. Building decentralized social media.',
				avatarUrl:
					'https://files.mastodon.social/accounts/avatars/000/000/001/original/dc2f12deb8684463.jpg',
				feedUrl: 'https://mastodon.social/@Gargron.rss',
			},
			{
				username: 'evan',
				instance: 'cosocial.ca',
				displayName: 'Evan Prodromou',
				bio: 'Co-author of ActivityPub. Founder of pump.io, StatusNet, Identi.ca.',
				avatarUrl:
					'https://media.cosocial.ca/accounts/avatars/109/332/313/474/611/756/original/1538c380ff3e5c2a.jpeg',
				feedUrl: 'https://cosocial.ca/@evan.rss',
			},
			{
				username: 'hongminhee',
				instance: 'hollo.social',
				displayName: 'Hong Minhee',
				bio: 'Creator of Fedify and Hollo. Building ActivityPub tools and libraries.',
				avatarUrl:
					'https://hollo.social/accounts/avatars/original/a22e9b22-7e7c-43e5-8266-29ee53af4be9.webp',
				feedUrl: 'https://hollo.social/@hongminhee.rss',
			},
			{
				username: 'mike',
				instance: 'macgirvin.com',
				displayName: 'Mike Macgirvin',
				bio: 'Developer of Hubzilla, Streams, and other decentralized platforms.',
				avatarUrl: 'https://macgirvin.com/photo/profile/l/3',
				feedUrl: 'https://macgirvin.com/channel/mike.rss',
			},
		],
	},
	{
		slug: 'indieweb',
		title: 'IndieWeb',
		description:
			'People building and advocating for the IndieWeb — owning your content, Webmention, Micropub, and more.',
		accounts: [
			{
				username: 'tantek',
				instance: 'tantek.com',
				displayName: 'Tantek \u00C7elik',
				bio: 'Web standards, IndieWeb co-founder, working on making the web better.',
				avatarUrl: 'https://tantek.com/photo.jpg',
				feedUrl: 'https://tantek.com/updates.atom',
			},
			{
				username: 'aaronpk',
				instance: 'aaronparecki.com',
				displayName: 'Aaron Parecki',
				bio: 'IndieWeb co-founder. Creator of Micropub and IndieAuth specifications.',
				avatarUrl: 'https://aaronparecki.com/images/profile.jpg',
				feedUrl: 'https://aaronparecki.com/feed.xml',
			},
			{
				username: 'jamesg',
				instance: 'coffeehouse.jamesg.blog',
				displayName: 'James',
				bio: 'IndieWeb community member and web developer.',
				avatarUrl: 'https://jamesg.blog/assets/coffeeshop.jpg',
				feedUrl: 'https://jamesg.blog/feed.xml',
			},
			{
				username: 'david',
				instance: 'david.shanske.com',
				displayName: 'David Shanske',
				bio: 'IndieWeb WordPress plugin developer. Building bridges between WordPress and the IndieWeb.',
				avatarUrl:
					'https://david.shanske.com/wp-content/uploads/avatar-privacy/cache/gravatar/2/b/2b0a13da481e64cdd5a55b0eef04db03d0e0b2ee88ea3d897a5a1c93ae4cfc67-96.png',
				feedUrl: 'https://david.shanske.com/feed/',
			},
		],
	},
];

/**
 * Get all starter packs.
 */
export function getAllPacks(): StarterPack[] {
	return starterPacks;
}

/**
 * Get a single starter pack by slug.
 */
export function getPackBySlug( slug: string ): StarterPack | undefined {
	return starterPacks.find( ( pack ) => pack.slug === slug );
}

/**
 * Build the full account URL for a Fediverse account.
 */
export function getAccountUrl( account: FediAccount ): string {
	return `https://${ account.instance }/@${ account.username }`;
}
