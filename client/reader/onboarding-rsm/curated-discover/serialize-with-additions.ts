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
 * empty are also skipped — but in practice an empty tag means it had no
 * existing entries and no additions, so the operator never sees it.
 */
export function serializeWithAdditions( {
	variableName,
	tagMap,
	additions,
}: SerializeWithAdditionsOptions ): string {
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

	return serializeCurated( {
		variableName,
		tagMap: merged,
		getMetadata: ( entry ) => ( {
			feedUrl: entry.feed_URL,
			hasIcon: entry.has_icon,
		} ),
	} );
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
