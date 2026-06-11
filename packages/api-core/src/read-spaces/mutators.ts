import { wpcom } from '../wpcom-fetcher';
import { adaptReadSpaceDetails, type ReadSpaceApiItem } from './adapters';
import type {
	CreateReadSpaceParams,
	ReadSpaceDeletionResult,
	ReadSpaceDetails,
	ReadSpaceSourceMutationParams,
} from './types';

/**
 * Create a space via the wpcom/v2 `POST /reader/spaces/new` endpoint, returning
 * the created space (detail shape) so the create flow can seed the caches.
 */
export async function createReadSpace(
	params: CreateReadSpaceParams
): Promise< ReadSpaceDetails > {
	const item: ReadSpaceApiItem = await wpcom.req.post(
		{
			path: '/reader/spaces/new',
			apiNamespace: 'wpcom/v2',
		},
		{
			title: params.name,
			tags: params.tags,
			// The endpoint also accepts these optional fields, but the create form
			// doesn't collect them yet, so we don't send them. The server applies
			// defaults (a random color/icon from the palette, no sites). Wire these
			// up once the form gains a source picker (sites) and a layout picker:
			// sites: params.sites,             // int[] of wpcom blog_ids to follow
			// layout_color: params.layoutColor, // SpaceColor — defaults server-side
			// layout_icon: params.layoutIcon,   // SpaceIcon  — defaults server-side
		}
	);

	return adaptReadSpaceDetails( item );
}

/**
 * Permanently delete a space via the wpcom/v2 `POST /reader/spaces/{id}/delete`
 * endpoint. Hard delete — there is no trash/undo, so callers should confirm
 * first. Server enforces owner-only access; a missing-or-not-yours space and a
 * truly-absent one both return `404 reader_spaces_not_found` (by design — we
 * don't reveal other users' spaces).
 * @param spaceId The space's id (the stringified numeric id the client holds).
 */
export async function deleteReadSpace( spaceId: string ): Promise< ReadSpaceDeletionResult > {
	return wpcom.req.post( {
		// `spaceId` is opaque to us — encode it so a non-numeric id can't smuggle
		// extra path segments (matches the Reader route builders).
		path: `/reader/spaces/${ encodeURIComponent( spaceId ) }/delete`,
		apiNamespace: 'wpcom/v2',
	} );
}

export function addReadSpaceSource( params: ReadSpaceSourceMutationParams ): Promise< void > {
	void params;
	return Promise.resolve();
}

export function deleteReadSpaceSource( params: ReadSpaceSourceMutationParams ): Promise< void > {
	void params;
	return Promise.resolve();
}
