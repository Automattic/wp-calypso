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

/**
 * Generate an opaque, random-ish id for a hard-coded space. Real spaces will
 * carry server-assigned ids; this just stands in so the rest of the UI can key
 * and route on an id rather than a human-readable slug.
 *
 * TEMPORARY: ids are randomised at module load, so they are stable only within
 * a single page session — a copied `/reader/spaces/<id>` deep link won't
 * survive a reload, and an SSR'd sidebar could disagree with the client on the
 * generated value. That's acceptable for this dark-shipped placeholder and goes
 * away in RSM-4119, which replaces this list with real, server-assigned ids.
 */
function randomSpaceId(): string {
	return Math.random().toString( 36 ).slice( 2, 12 );
}

export interface Space {
	id: string;
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
		id: randomSpaceId(),
		name: 'Work',
		icon: inbox,
		color: 'blue',
		unreadCount: 14,
		lastActivityLabel: '8 min ago',
	},
	{
		id: randomSpaceId(),
		name: 'Gaming',
		icon: box,
		color: 'purple',
		unreadCount: 9,
		lastActivityLabel: '35 min ago',
	},
	{
		id: randomSpaceId(),
		name: 'YouTube',
		icon: video,
		color: 'red',
		unreadCount: 23,
		lastActivityLabel: '1 hr ago',
	},
	{
		id: randomSpaceId(),
		name: 'Humor',
		icon: comment,
		color: 'orange',
		unreadCount: 31,
		lastActivityLabel: '2 hr ago',
	},
	{
		id: randomSpaceId(),
		name: 'Food',
		icon: cart,
		color: 'gray',
		unreadCount: 12,
		lastActivityLabel: '1 hr ago',
	},
	{
		id: randomSpaceId(),
		name: 'Health',
		icon: starFilled,
		color: 'green',
		unreadCount: 6,
		lastActivityLabel: '3 hr ago',
	},
	{
		id: randomSpaceId(),
		name: 'Cats',
		icon: pages,
		color: 'celadon',
		unreadCount: 0,
		lastActivityLabel: 'just now',
	},
];

export const SPACES_BASE_PATH = '/reader/spaces';

export function getSpacePath( id: string ): string {
	// Encode the segment to match the other Reader route builders; ids are
	// opaque, so never assume they are already URL-safe.
	return `${ SPACES_BASE_PATH }/${ encodeURIComponent( id ) }`;
}

export function getSpaceById( id: string ): Space | undefined {
	return SPACES.find( ( space ) => space.id === id );
}
