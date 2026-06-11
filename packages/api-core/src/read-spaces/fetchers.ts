import { wpcom } from '../wpcom-fetcher';
import { adaptReadSpace, type ReadSpaceApiItem } from './adapters';
import type { ReadSpace, ReadSpaceDetails } from './types';

/**
 * Hard-coded placeholder spaces returned while Spaces are dark-shipped behind
 * the `reader/spaces` feature flag. Ids are stable opaque values so deep links
 * survive a reload without teaching consumers to treat names as URL slugs.
 *
 * These are list-shaped (no `sources`); the single-space fetcher adds the
 * sources, matching the eventual list vs detail endpoints.
 */
const PLACEHOLDER_SPACES: ReadSpace[] = [
	{
		id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
		name: 'Work',
		tags: [],
		layout: { color: 'blue', icon: 'inbox' },
	},
	{
		id: '5cc71d31-97d1-4b7d-93c7-42a5ce9d4cf1',
		name: 'Gaming',
		tags: [],
		layout: { color: 'purple', icon: 'box' },
	},
	{
		id: '9708ac5a-8edc-4c4c-9c2e-bb07cb40ff5c',
		name: 'YouTube',
		tags: [],
		layout: { color: 'red', icon: 'video' },
	},
	{
		id: 'c23779a1-b01b-491f-aa01-c32cc5bf6b16',
		name: 'Humor',
		tags: [],
		layout: { color: 'orange', icon: 'comment' },
	},
	{
		id: '0be74629-6b4f-4fd5-8d1d-0d6e53ac5703',
		name: 'Food',
		tags: [],
		layout: { color: 'gray', icon: 'cart' },
	},
	{
		id: 'd41c7eb4-11ad-4493-87cb-b0c3a70a99d5',
		name: 'Health',
		tags: [],
		layout: { color: 'green', icon: 'star' },
	},
	{
		id: 'b6f0f66a-c35f-49b2-9df8-9474e6e66a5b',
		name: 'Cats',
		tags: [],
		layout: { color: 'celadon', icon: 'pages' },
	},
];

/**
 * Fetch the current user's spaces from the wpcom/v2 `GET /reader/spaces`
 * endpoint, adapting each item from the snake_case wire shape (`title`,
 * `layout_color`/`layout_icon`) to the client `ReadSpace` via `adaptReadSpace`.
 */
export async function fetchReadSpaces(): Promise< ReadSpace[] > {
	const response = await wpcom.req.get( {
		path: '/reader/spaces',
		apiNamespace: 'wpcom/v2',
	} );

	const items: ReadSpaceApiItem[] = Array.isArray( response ) ? response : [];
	return items.map( adaptReadSpace );
}

/**
 * Fetch a single space's details, including its sources.
 *
 * TODO(RSM-4145): the detail endpoint isn't wired yet — this still resolves the
 * matching placeholder space with an empty source list. The create mutation
 * seeds the detail cache for spaces created this session, but the live list now
 * returns real spaces this set doesn't contain, so opening one's sources after a
 * reload (which clears the seeded cache) currently throws. Wiring the real
 * `GET /reader/spaces/{id}` closes that gap.
 */
export async function fetchReadSpace( spaceId: string ): Promise< ReadSpaceDetails > {
	const space = PLACEHOLDER_SPACES.find( ( item ) => item.id === spaceId );
	if ( ! space ) {
		throw new Error( `Space not found: ${ spaceId }` );
	}
	// Independent copy (nested `tags`/`layout` cloned, fresh `sources`) so callers
	// can't mutate the shared `PLACEHOLDER_SPACES`.
	return { ...space, tags: [ ...space.tags ], layout: { ...space.layout }, sources: [] };
}
