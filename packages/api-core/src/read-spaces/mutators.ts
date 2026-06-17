import { wpcom } from '../wpcom-fetcher';
import { adaptReadSpaceDetails, type ReadSpaceApiItem } from './adapters';
import type {
	CreateReadSpaceParams,
	ReadSpaceDeletionResult,
	ReadSpaceDetails,
	ReadSpaceSourceMutationParams,
	UpdateReadSpaceParams,
} from './types';

/**
 * Create a space via the wpcom/v2 `POST /reader/spaces/new` endpoint, returning
 * the created space (detail shape). Only `title` is required; `feeds`, `tags`,
 * and the layout fields are sent when provided (the server defaults the rest).
 */
export async function createReadSpace(
	params: CreateReadSpaceParams
): Promise< ReadSpaceDetails > {
	const body: Record< string, unknown > = { title: params.name };
	if ( params.feeds ) {
		body.feeds = params.feeds;
	}
	if ( params.tags ) {
		body.tags = params.tags;
	}
	if ( params.layoutColor ) {
		body.layout_color = params.layoutColor;
	}
	if ( params.layoutIcon ) {
		body.layout_icon = params.layoutIcon;
	}

	const item: ReadSpaceApiItem = await wpcom.req.post(
		{ path: '/reader/spaces/new', apiNamespace: 'wpcom/v2' },
		body
	);

	return adaptReadSpaceDetails( item );
}

/**
 * Update a space via `POST /reader/spaces/{id}/update`, returning the updated
 * detail. Sends only the provided fields (at least one is required server-side).
 * `tags` is a full replace of the tag set, not an add/remove.
 */
export async function updateReadSpace(
	spaceId: string,
	params: UpdateReadSpaceParams
): Promise< ReadSpaceDetails > {
	const body: Record< string, unknown > = {};
	if ( params.name !== undefined ) {
		body.title = params.name;
	}
	if ( params.tags !== undefined ) {
		body.tags = params.tags;
	}
	if ( params.layoutColor !== undefined ) {
		body.layout_color = params.layoutColor;
	}
	if ( params.layoutIcon !== undefined ) {
		body.layout_icon = params.layoutIcon;
	}

	const item: ReadSpaceApiItem = await wpcom.req.post(
		{ path: `/reader/spaces/${ encodeURIComponent( spaceId ) }/update`, apiNamespace: 'wpcom/v2' },
		body
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

/**
 * Add a followed feed to a space via `POST /reader/spaces/{id}/feeds/new`,
 * returning the updated detail. The feed is identified by the subscription's
 * feed id (falling back to its feed URL); the server resolves it.
 */
export async function addReadSpaceSource( {
	spaceId,
	subscription,
}: ReadSpaceSourceMutationParams ): Promise< ReadSpaceDetails > {
	const item: ReadSpaceApiItem = await wpcom.req.post(
		{
			path: `/reader/spaces/${ encodeURIComponent( spaceId ) }/feeds/new`,
			apiNamespace: 'wpcom/v2',
		},
		{ feed: subscription.feed_ID ?? subscription.feed_URL }
	);

	return adaptReadSpaceDetails( item );
}

/**
 * Remove a followed feed from a space via
 * `POST /reader/spaces/{id}/feeds/{feed_id}/delete`, returning the updated
 * detail. Removal is keyed by the numeric feed id (from `follows[].feed_id`).
 */
export async function deleteReadSpaceSource( {
	spaceId,
	subscription,
}: ReadSpaceSourceMutationParams ): Promise< ReadSpaceDetails > {
	const item: ReadSpaceApiItem = await wpcom.req.post( {
		path: `/reader/spaces/${ encodeURIComponent( spaceId ) }/feeds/${ encodeURIComponent(
			String( subscription.feed_ID )
		) }/delete`,
		apiNamespace: 'wpcom/v2',
	} );

	return adaptReadSpaceDetails( item );
}
