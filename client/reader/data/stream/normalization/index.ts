import {
	createStreamDataFromCards,
	createStreamDataFromPosts,
	createStreamDataFromSites,
} from './helpers';
import type { StreamItem } from '../types';
import type { ReadStreamResponse } from '@automattic/api-core';

export * from './helpers';

/**
 * Picks the field on each item that should be used as the stream's
 * chronological key. Conversations sort by last comment, liked streams by the
 * like timestamp, everything else by post date.
 */
export function getStreamDateProperty( streamType: string ): string {
	if ( streamType === 'conversations' || streamType === 'conversations-a8c' ) {
		return 'last_comment_date_gmt';
	}
	if ( streamType === 'likes' ) {
		return 'date_liked';
	}
	return 'date';
}

export interface NormalizedStreamPage {
	streamItems: StreamItem[];
	streamPosts: Array< Record< string, unknown > >;
}

/**
 * Normalize a `ReadStreamResponse` into the `{ streamItems, streamPosts }`
 * pair the Reader UI consumes. Routes through the right
 * `createStreamDataFrom*` helper based on which top-level field the API
 * returned (cards vs sites vs posts).
 */
export function normalizeStreamPage(
	data: ReadStreamResponse,
	streamType: string
): NormalizedStreamPage {
	const dateProperty = getStreamDateProperty( streamType );
	if ( data.cards ) {
		const fromCards = createStreamDataFromCards( data.cards, dateProperty );
		return { streamItems: fromCards.streamItems, streamPosts: fromCards.streamPosts };
	}
	if ( data.sites ) {
		const fromSites = createStreamDataFromSites(
			data.sites as Parameters< typeof createStreamDataFromSites >[ 0 ],
			dateProperty
		);
		return { streamItems: fromSites.streamItems, streamPosts: fromSites.streamPosts };
	}
	const fromPosts = createStreamDataFromPosts(
		data.posts as Parameters< typeof createStreamDataFromPosts >[ 0 ],
		dateProperty
	);
	return { streamItems: fromPosts.streamItems, streamPosts: fromPosts.streamPosts };
}
