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
		color: 'blue',
		icon: 'inbox',
	},
	{
		id: '5cc71d31-97d1-4b7d-93c7-42a5ce9d4cf1',
		name: 'Gaming',
		tags: [],
		color: 'purple',
		icon: 'box',
	},
	{
		id: '9708ac5a-8edc-4c4c-9c2e-bb07cb40ff5c',
		name: 'YouTube',
		tags: [],
		color: 'red',
		icon: 'video',
	},
	{
		id: 'c23779a1-b01b-491f-aa01-c32cc5bf6b16',
		name: 'Humor',
		tags: [],
		color: 'orange',
		icon: 'comment',
	},
	{
		id: '0be74629-6b4f-4fd5-8d1d-0d6e53ac5703',
		name: 'Food',
		tags: [],
		color: 'gray',
		icon: 'cart',
	},
	{
		id: 'd41c7eb4-11ad-4493-87cb-b0c3a70a99d5',
		name: 'Health',
		tags: [],
		color: 'green',
		icon: 'star',
	},
	{
		id: 'b6f0f66a-c35f-49b2-9df8-9474e6e66a5b',
		name: 'Cats',
		tags: [],
		color: 'celadon',
		icon: 'pages',
	},
];

/**
 * Fetch the current user's spaces.
 *
 * TODO(RSM-4145): replace with the real `GET` once the list endpoint exists.
 * Until then it resolves the hard-coded placeholder set; spaces created in the
 * session are appended to the React Query cache by the create mutation.
 */
export async function fetchReadSpaces(): Promise< ReadSpace[] > {
	return PLACEHOLDER_SPACES.map( ( space ) => ( { ...space } ) );
}

/**
 * Fetch a single space's details, including its sources.
 *
 * TODO(RSM-4145): replace with the real `GET /spaces/{id}` once it exists.
 * Until then it resolves the matching placeholder space with an empty source
 * list. Spaces created in the session aren't in the placeholder set — the
 * create mutation seeds their detail cache directly, so this never runs for them.
 */
export async function fetchReadSpace( spaceId: string ): Promise< ReadSpaceDetails > {
	const space = PLACEHOLDER_SPACES.find( ( item ) => item.id === spaceId );
	if ( ! space ) {
		throw new Error( `Space not found: ${ spaceId }` );
	}
	return { ...space, sources: [] };
}
