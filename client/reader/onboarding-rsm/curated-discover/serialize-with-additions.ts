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
	/**
	 * Additions dropped because their `feed_ID` was already present in the
	 * source `tagMap` for the same tag (or appeared more than once within the
	 * additions list itself). Prevents the compounding-duplicate bug where the
	 * operator copies → pastes → adds more → copies again, with the prior
	 * additions still living in localStorage. `console.warn`'d so the operator
	 * can see what was deduped.
	 */
	deduped: number;
}

/**
 * Build an updated curated-blogs source file by prepending the operator's
 * newly-added candidates to the existing curated entries for each tag.
 *
 * Internally:
 *
 * 1. Build a merged `tagMap` keyed by tag, where each tag's array is
 *    `[...reverse(dedupedAdditions), ...existing]`. Newer-additions-first
 *    matches the spec ("newer items at the top of each tag section"); the
 *    `use-added-candidates` store keeps additions in append order so reversing
 *    here is the right place to apply the read-time inversion.
 *
 *    Additions are deduped against `existing` (per tag) before merging so
 *    repeated copy → paste → add-more → copy cycles can't compound the same
 *    `feed_ID` into the output: stale localStorage rows whose feeds already
 *    landed in the source from a prior export are silently dropped. Within
 *    a single tag's additions array, repeated `feed_ID`s also collapse to the
 *    newest occurrence (after reversal) — defense in depth against a
 *    corrupted store, since `useAddedCandidates.add` already no-ops on
 *    same-tag dupes.
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
	let deduped = 0;

	// Walk existing tags first so the output order matches the source file
	// (the operator's mental model is "society.tsx had education, nature,
	// …" — keeping that order preserves diff readability).
	for ( const [ tag, existing ] of Object.entries( tagMap ) ) {
		const adds = additions[ tag ] ?? [];
		const { kept, dropped } = dedupAdditions( adds, existing, tag );
		deduped += dropped;
		merged[ tag ] = [ ...reversed( kept ), ...existing ];
	}

	// Pick up any new tags that exist only in the additions map (e.g. the
	// operator added a candidate under a tag that the source file didn't
	// previously cover). Append after the existing-tag block.
	for ( const [ tag, adds ] of Object.entries( additions ) ) {
		if ( merged[ tag ] !== undefined ) {
			continue;
		}
		const { kept, dropped } = dedupAdditions( adds, [], tag );
		deduped += dropped;
		merged[ tag ] = [ ...reversed( kept ) ];
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

	return { source, skipped, deduped };
}

interface DedupAdditionsResult {
	/** Additions to keep, in their original (insertion) order. */
	kept: CuratedBlog[];
	/** Number dropped (already in `existing`, or duplicate within `adds`). */
	dropped: number;
}

/**
 * Drop additions whose `feed_ID` already lives in `existing`, or that repeat
 * within the additions list itself. The latter shouldn't happen via the normal
 * `useAddedCandidates.add` path (it no-ops on same-tag dupes) but we belt-and-
 * brace against a hand-edited / corrupted localStorage entry.
 *
 * Both classes of drop are `console.warn`'d with the tag + feed_ID so the
 * operator can see what was filtered when they hit Copy.
 */
function dedupAdditions(
	adds: readonly CuratedBlog[],
	existing: readonly CuratedBlog[],
	tag: string
): DedupAdditionsResult {
	if ( adds.length === 0 ) {
		return { kept: [], dropped: 0 };
	}
	const existingIds = new Set( existing.map( ( e ) => e.feed_ID ) );
	const seenInAdds = new Set< number >();
	const kept: CuratedBlog[] = [];
	let dropped = 0;
	for ( const entry of adds ) {
		if ( existingIds.has( entry.feed_ID ) ) {
			dropped++;
			// eslint-disable-next-line no-console
			console.warn(
				`[curated-discover] Dropping addition feed_ID=${ entry.feed_ID } in tag "${ tag }": already in source.`,
				entry
			);
			continue;
		}
		if ( seenInAdds.has( entry.feed_ID ) ) {
			dropped++;
			// eslint-disable-next-line no-console
			console.warn(
				`[curated-discover] Dropping addition feed_ID=${ entry.feed_ID } in tag "${ tag }": duplicate within additions.`,
				entry
			);
			continue;
		}
		seenInAdds.add( entry.feed_ID );
		kept.push( entry );
	}
	return { kept, dropped };
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
