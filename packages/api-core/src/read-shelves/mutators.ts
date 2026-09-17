import { wpcom } from '../wpcom-fetcher';
import { adaptReadShelfDetails, type ReadShelfApiItem } from './adapters';
import type {
	CreateReadShelfParams,
	ReadShelfDeletionResult,
	ReadShelfDetails,
	ReadShelfSourceMutationParams,
	UpdateReadShelfParams,
} from './types';

/**
 * Create a shelf via the wpcom/v2 `POST /reader/shelves` endpoint, returning the
 * created shelf (detail shape). Only `title` is required; `feeds`, `tags`, and
 * `layout` are sent when provided (the server defaults the rest).
 */
export async function createReadShelf(
	params: CreateReadShelfParams
): Promise< ReadShelfDetails > {
	const body: Record< string, unknown > = { title: params.name };
	if ( params.feeds ) {
		body.feeds = params.feeds;
	}
	if ( params.tags ) {
		body.tags = params.tags;
	}
	if ( params.languages ) {
		body.languages = params.languages;
	}
	if ( params.layout ) {
		body.layout = params.layout;
	}

	const item: ReadShelfApiItem = await wpcom.req.post(
		{ path: '/reader/shelves', apiNamespace: 'wpcom/v2' },
		body
	);

	return adaptReadShelfDetails( item );
}

/**
 * Update a shelf via `PUT /reader/shelves/{id}`, returning the updated detail.
 * Sends only the provided fields (at least one is required server-side). `tags`
 * and `feeds` are full replaces; `layout` is a partial merge (send only the
 * fields you're changing).
 */
export async function updateReadShelf(
	shelfId: string,
	params: UpdateReadShelfParams
): Promise< ReadShelfDetails > {
	const body: Record< string, unknown > = {};
	if ( params.name !== undefined ) {
		body.title = params.name;
	}
	if ( params.tags !== undefined ) {
		body.tags = params.tags;
	}
	if ( params.languages !== undefined ) {
		body.languages = params.languages;
	}
	if ( params.feeds !== undefined ) {
		body.feeds = params.feeds;
	}
	if ( params.layout !== undefined ) {
		body.layout = params.layout;
	}

	const item: ReadShelfApiItem = await wpcom.req.post(
		{
			path: `/reader/shelves/${ encodeURIComponent( shelfId ) }`,
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
		},
		body
	);

	return adaptReadShelfDetails( item );
}

/**
 * Permanently delete a shelf via the wpcom/v2 `DELETE /reader/shelves/{id}`
 * endpoint. Hard delete — there is no trash/undo, so callers should confirm
 * first. Server enforces owner-only access; a missing-or-not-yours shelf and a
 * truly-absent one both return `404 reader_shelves_not_found` (by design — we
 * don't reveal other users' shelves).
 * @param shelfId The shelf's id (the stringified numeric id the client holds).
 */
export async function deleteReadShelf( shelfId: string ): Promise< ReadShelfDeletionResult > {
	return wpcom.req.post( {
		// `shelfId` is opaque to us — encode it so a non-numeric id can't smuggle
		// extra path segments (matches the Reader route builders).
		path: `/reader/shelves/${ encodeURIComponent( shelfId ) }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}

/**
 * Add a followed feed to a shelf via `POST /reader/shelves/{id}/feeds`, returning
 * the updated detail. The feed is identified by the subscription's feed id
 * (falling back to its feed URL); the server resolves it.
 */
export async function addReadShelfSource( {
	shelfId,
	subscription,
}: ReadShelfSourceMutationParams ): Promise< ReadShelfDetails > {
	const item: ReadShelfApiItem = await wpcom.req.post(
		{
			path: `/reader/shelves/${ encodeURIComponent( shelfId ) }/feeds`,
			apiNamespace: 'wpcom/v2',
		},
		{ feed: subscription.feed_ID ?? subscription.feed_URL }
	);

	return adaptReadShelfDetails( item );
}

/**
 * Remove a followed feed from a shelf via
 * `DELETE /reader/shelves/{id}/feeds/{feed_id}`, returning the updated detail.
 * Removal is keyed by the numeric feed id (from `follows[].feed_id`).
 */
export async function deleteReadShelfSource( {
	shelfId,
	subscription,
}: ReadShelfSourceMutationParams ): Promise< ReadShelfDetails > {
	// Removal is keyed strictly by the numeric feedbag feed id (from
	// `follows[].feed_id`). `feed_ID` is loosely typed, so guard against a
	// missing/non-numeric value rather than issuing a `/feeds/null` request.
	const feedId = Number( subscription.feed_ID );
	if ( ! Number.isInteger( feedId ) || feedId <= 0 ) {
		throw new Error( 'Cannot remove a shelf feed without a numeric feed id.' );
	}

	const item: ReadShelfApiItem = await wpcom.req.post( {
		path: `/reader/shelves/${ encodeURIComponent( shelfId ) }/feeds/${ feedId }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );

	return adaptReadShelfDetails( item );
}
