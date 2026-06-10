import type { ReadSpace } from './types';

/**
 * Hard-coded placeholder spaces returned while Spaces are dark-shipped behind
 * the `reader/spaces` feature flag. Ids are stable opaque values so deep links
 * survive a reload without teaching consumers to treat names as URL slugs.
 */
const PLACEHOLDER_SPACES: ReadSpace[] = [
	{
		id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
		name: 'Work',
		tags: [],
		color: 'blue',
		icon: 'inbox',
		sources: [],
	},
	{
		id: '5cc71d31-97d1-4b7d-93c7-42a5ce9d4cf1',
		name: 'Gaming',
		tags: [],
		color: 'purple',
		icon: 'box',
		sources: [],
	},
	{
		id: '9708ac5a-8edc-4c4c-9c2e-bb07cb40ff5c',
		name: 'YouTube',
		tags: [],
		color: 'red',
		icon: 'video',
		sources: [],
	},
	{
		id: 'c23779a1-b01b-491f-aa01-c32cc5bf6b16',
		name: 'Humor',
		tags: [],
		color: 'orange',
		icon: 'comment',
		sources: [],
	},
	{
		id: '0be74629-6b4f-4fd5-8d1d-0d6e53ac5703',
		name: 'Food',
		tags: [],
		color: 'gray',
		icon: 'cart',
		sources: [],
	},
	{
		id: 'd41c7eb4-11ad-4493-87cb-b0c3a70a99d5',
		name: 'Health',
		tags: [],
		color: 'green',
		icon: 'star',
		sources: [],
	},
	{
		id: 'b6f0f66a-c35f-49b2-9df8-9474e6e66a5b',
		name: 'Cats',
		tags: [],
		color: 'celadon',
		icon: 'pages',
		sources: [],
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
