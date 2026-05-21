import { serializeCurated } from '../curated-review/serialize-curated';
import type { AddedCandidatesByTag } from './use-added-candidates';
import type { CuratedBlog, CuratedBlogsList } from '../curated-blogs';

export interface SerializeWithAdditionsOptions {
	/** TypeScript identifier of the exported map, e.g. `lifestyleBlogs`. */
	variableName: string;
	/** Tag → entries map from the existing curated source file. */
	tagMap: CuratedBlogsList;
	/** Tag → operator-added entries (insertion order, oldest first). */
	additions: AddedCandidatesByTag;
}

export interface SerializeWithAdditionsResult {
	/** Generated TypeScript source body, ready for clipboard. */
	source: string;
	/**
	 * Entries that were dropped because they lacked the required string
	 * fields (`feed_URL`, `site_URL`, `site_name`) or a known `has_icon`. In
	 * practice this only fires when localStorage carries a row from before the
	 * `buildEntryForAdd` validation tightened — `console.warn`'d with the
	 * tag + feed_ID for diagnosis.
	 */
	skipped: number;
}

/**
 * Build an updated curated-blogs source file by prepending the operator's
 * newly-added candidates to the existing curated entries for each tag.
 *
 * Internally:
 *
 * 1. Build a merged `tagMap` keyed by tag, where each tag's array is
 *    `[...reverse(additions), ...existing]`. Newer-additions-first matches
 *    the spec ("newer items at the top of each tag section"); the
 *    `use-added-candidates` store keeps additions in append order so
 *    reversing here is the right place to apply the read-time inversion.
 *
 * 2. Delegate to `serializeCurated` with a `getMetadata` resolver that
 *    pulls `feedUrl` and `hasIcon` straight off each `CuratedBlog` (additions
 *    captured these at add-time; existing entries already have them baked
 *    in from the prior review pass).
 *
 * Tags not present in either source are skipped. Tags whose merged list is
 * empty (or whose every entry was filtered for missing fields) are also
 * dropped from the output.
 */
export function serializeWithAdditions( {
	variableName,
	tagMap,
	additions,
}: SerializeWithAdditionsOptions ): SerializeWithAdditionsResult {
	const merged: CuratedBlogsList = {};

	// Walk existing tags first so the output order matches the source file
	// (the operator's mental model is "society.tsx had education, nature,
	// …" — keeping that order preserves diff readability).
	for ( const [ tag, existing ] of Object.entries( tagMap ) ) {
		const adds = additions[ tag ] ?? [];
		merged[ tag ] = [ ...reversed( adds ), ...existing ];
	}

	// Pick up any new tags that exist only in the additions map (e.g. the
	// operator added a candidate under a tag that the source file didn't
	// previously cover). Append after the existing-tag block.
	for ( const [ tag, adds ] of Object.entries( additions ) ) {
		if ( merged[ tag ] !== undefined ) {
			continue;
		}
		merged[ tag ] = [ ...reversed( adds ) ];
	}

	// Track which tag the entry currently belongs to so the warn message can
	// point the operator at it. `getMetadata` only sees the entry itself, so
	// we precompute this lookup before delegating.
	const tagByFeedId = new Map< number, string >();
	for ( const [ tag, entries ] of Object.entries( merged ) ) {
		for ( const entry of entries ) {
			// Last-write-wins is fine here — we only use it for diagnostic logs,
			// and a feed_ID appearing in two tags simultaneously is itself
			// abnormal but not blocking.
			tagByFeedId.set( entry.feed_ID, tag );
		}
	}

	let skipped = 0;
	const source = serializeCurated( {
		variableName,
		tagMap: merged,
		getMetadata: ( entry ) => {
			const reason = describeIncomplete( entry );
			if ( reason ) {
				skipped++;
				const tag = tagByFeedId.get( entry.feed_ID ) ?? '<unknown>';
				// eslint-disable-next-line no-console
				console.warn(
					`[curated-discover] Skipping incomplete entry feed_ID=${ entry.feed_ID } in tag "${ tag }": ${ reason }`,
					entry
				);
				return null;
			}
			return {
				feedUrl: entry.feed_URL,
				hasIcon: entry.has_icon,
			};
		},
	} );

	return { source, skipped };
}

function describeIncomplete( entry: CuratedBlog ): string | null {
	if ( typeof entry.feed_URL !== 'string' || entry.feed_URL.length === 0 ) {
		return 'missing feed_URL';
	}
	if ( typeof entry.site_URL !== 'string' || entry.site_URL.length === 0 ) {
		return 'missing site_URL';
	}
	if ( typeof entry.site_name !== 'string' || entry.site_name.length === 0 ) {
		return 'missing site_name';
	}
	if ( typeof entry.has_icon !== 'boolean' ) {
		return 'missing has_icon';
	}
	return null;
}

function reversed< T >( list: readonly T[] ): T[] {
	const out: T[] = [];
	for ( let i = list.length - 1; i >= 0; i-- ) {
		out.push( list[ i ] );
	}
	return out;
}

// Re-export so consumers don't need to import the type from `curated-blogs`.
export type { CuratedBlog };
