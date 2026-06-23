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
 * Create a space via the wpcom/v2 `POST /reader/spaces` endpoint, returning the
 * created space (detail shape). Only `title` is required; `feeds`, `tags`, and
 * `layout` are sent when provided (the server defaults the rest).
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
	if ( params.layout ) {
		body.layout = params.layout;
	}

	const item: ReadSpaceApiItem = await wpcom.req.post(
		{ path: '/reader/spaces', apiNamespace: 'wpcom/v2' },
		body
	);

	return adaptReadSpaceDetails( item );
}

/**
 * Update a space via `PUT /reader/spaces/{id}`, returning the updated detail.
 * Sends only the provided fields (at least one is required server-side). `tags`
 * and `feeds` are full replaces; `layout` is a partial merge (send only the
 * fields you're changing).
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
	if ( params.feeds !== undefined ) {
		body.feeds = params.feeds;
	}
	if ( params.layout !== undefined ) {
		body.layout = params.layout;
	}

	const item: ReadSpaceApiItem = await wpcom.req.post(
		{
			path: `/reader/spaces/${ encodeURIComponent( spaceId ) }`,
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
		},
		body
	);

	return adaptReadSpaceDetails( item );
}

/**
 * Permanently delete a space via the wpcom/v2 `DELETE /reader/spaces/{id}`
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
		path: `/reader/spaces/${ encodeURIComponent( spaceId ) }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}

/**
 * Add a followed feed to a space via `POST /reader/spaces/{id}/feeds`, returning
 * the updated detail. The feed is identified by the subscription's feed id
 * (falling back to its feed URL); the server resolves it.
 */
export async function addReadSpaceSource( {
	spaceId,
	subscription,
}: ReadSpaceSourceMutationParams ): Promise< ReadSpaceDetails > {
	const item: ReadSpaceApiItem = await wpcom.req.post(
		{
			path: `/reader/spaces/${ encodeURIComponent( spaceId ) }/feeds`,
			apiNamespace: 'wpcom/v2',
		},
		{ feed: subscription.feed_ID ?? subscription.feed_URL }
	);

	return adaptReadSpaceDetails( item );
}

/**
 * Remove a followed feed from a space via
 * `DELETE /reader/spaces/{id}/feeds/{feed_id}`, returning the updated detail.
 * Removal is keyed by the numeric feed id (from `follows[].feed_id`).
 */
export async function deleteReadSpaceSource( {
	spaceId,
	subscription,
}: ReadSpaceSourceMutationParams ): Promise< ReadSpaceDetails > {
	// Removal is keyed strictly by the numeric feedbag feed id (from
	// `follows[].feed_id`). `feed_ID` is loosely typed, so guard against a
	// missing/non-numeric value rather than issuing a `/feeds/null` request.
	const feedId = Number( subscription.feed_ID );
	if ( ! Number.isInteger( feedId ) || feedId <= 0 ) {
		throw new Error( 'Cannot remove a space feed without a numeric feed id.' );
	}

	const item: ReadSpaceApiItem = await wpcom.req.post( {
		path: `/reader/spaces/${ encodeURIComponent( spaceId ) }/feeds/${ feedId }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );

	return adaptReadSpaceDetails( item );
}
