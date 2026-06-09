import { box, cart, comment, inbox, pages, starFilled, video } from '@wordpress/icons';

/**
 * Hard-coded Spaces used to prototype the v0 UI.
 *
 * Spaces are dark-shipped behind the `reader/spaces` feature flag and have no
 * backend yet. This static list lets us build and review the sidebar/entry
 * point against a realistic shape. RSM-4119 replaces it with a real,
 * dynamically-fetched list — keep the `Space` shape close to what the API is
 * expected to return so that swap stays small. The icons below are approximate
 * placeholder glyphs; real spaces will carry their own iconography.
 */

export type SpaceColor = 'blue' | 'purple' | 'red' | 'orange' | 'gray' | 'green' | 'celadon';

export interface Space {
	slug: string;
	name: string;
	/** A `@wordpress/icons` icon. Placeholder glyphs until spaces carry real icons. */
	icon: JSX.Element;
	color: SpaceColor;
	/** Unread/new post count. `0` hides the badge. */
	unreadCount: number;
	/**
	 * Human-readable "last activity" label. Static placeholder copy until
	 * RSM-4119 wires real timestamps and a relative-time formatter.
	 */
	lastActivityLabel: string;
}

export const SPACES: readonly Space[] = [
	{
		slug: 'work',
		name: 'Work',
		icon: inbox,
		color: 'blue',
		unreadCount: 14,
		lastActivityLabel: '8 min ago',
	},
	{
		slug: 'gaming',
		name: 'Gaming',
		icon: box,
		color: 'purple',
		unreadCount: 9,
		lastActivityLabel: '35 min ago',
	},
	{
		slug: 'youtube',
		name: 'YouTube',
		icon: video,
		color: 'red',
		unreadCount: 23,
		lastActivityLabel: '1 hr ago',
	},
	{
		slug: 'humor',
		name: 'Humor',
		icon: comment,
		color: 'orange',
		unreadCount: 31,
		lastActivityLabel: '2 hr ago',
	},
	{
		slug: 'food',
		name: 'Food',
		icon: cart,
		color: 'gray',
		unreadCount: 12,
		lastActivityLabel: '1 hr ago',
	},
	{
		slug: 'health',
		name: 'Health',
		icon: starFilled,
		color: 'green',
		unreadCount: 6,
		lastActivityLabel: '3 hr ago',
	},
	{
		slug: 'cats',
		name: 'Cats',
		icon: pages,
		color: 'celadon',
		unreadCount: 0,
		lastActivityLabel: 'just now',
	},
];

export const SPACES_BASE_PATH = '/reader/spaces';

export function getSpacePath( slug: string ): string {
	return `${ SPACES_BASE_PATH }/${ slug }`;
}

export function getSpaceBySlug( slug: string ): Space | undefined {
	return SPACES.find( ( space ) => space.slug === slug );
}
