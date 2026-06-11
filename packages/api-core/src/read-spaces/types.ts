/**
 * Reader Spaces — a Space groups subscriptions under a name plus optional tags.
 * v0 has a name and tags only, no description (see RSM-4110).
 *
 * `color` and `icon` are serializable presentation hints (string keys, not
 * rendered glyphs); the client maps `icon` to a `@wordpress/icons` element and
 * `color` to a CSS variant. RSM-4119 will replace the seeded list with real,
 * server-derived data.
 */
export type SpaceColor = 'blue' | 'purple' | 'red' | 'orange' | 'gray' | 'green' | 'celadon';

export type SpaceIcon =
	| 'inbox'
	| 'box'
	| 'video'
	| 'comment'
	| 'cart'
	| 'star'
	| 'pages'
	| 'category';

export interface ReadSpace {
	id: string;
	name: string;
	tags: string[];
	color: SpaceColor;
	icon: SpaceIcon;
}

export interface CreateReadSpaceParams {
	name: string;
	tags: string[];
}
