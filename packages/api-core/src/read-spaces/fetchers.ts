import type { ReadSpace } from './types';

/**
 * Hard-coded placeholder spaces returned while Spaces are dark-shipped behind
 * the `reader/spaces` feature flag. Ids are stable slugs so deep links survive
 * a reload; real spaces will carry server-assigned ids.
 */
const PLACEHOLDER_SPACES: ReadSpace[] = [
	{ id: 'work', name: 'Work', tags: [], color: 'blue', icon: 'inbox' },
	{ id: 'gaming', name: 'Gaming', tags: [], color: 'purple', icon: 'box' },
	{ id: 'youtube', name: 'YouTube', tags: [], color: 'red', icon: 'video' },
	{ id: 'humor', name: 'Humor', tags: [], color: 'orange', icon: 'comment' },
	{ id: 'food', name: 'Food', tags: [], color: 'gray', icon: 'cart' },
	{ id: 'health', name: 'Health', tags: [], color: 'green', icon: 'star' },
	{ id: 'cats', name: 'Cats', tags: [], color: 'celadon', icon: 'pages' },
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
