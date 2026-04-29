import { curatedBlogs as defaultCuratedBlogs } from '../curated-blogs';
import type { CuratedBlog, CuratedBlogsList } from '../curated-blogs';

export type GetPackBlogsOptions = {
	count?: number;
	curatedBlogs?: CuratedBlogsList;
	random?: () => number;
};

const pickRandom = < T >( items: T[], count: number, random: () => number ): T[] => {
	if ( count >= items.length ) {
		return [ ...items ];
	}
	const pool = [ ...items ];
	const picked: T[] = [];
	while ( picked.length < count && pool.length > 0 ) {
		const rawIndex = Math.floor( random() * pool.length );
		const index = Math.max( 0, Math.min( pool.length - 1, rawIndex ) );
		picked.push( pool.splice( index, 1 )[ 0 ] );
	}
	return picked;
};

/**
 * Distribute a fixed number of "slots" across N tags as evenly as possible.
 * Tags listed earlier in the input array receive the larger share when the
 * count does not divide evenly.
 *
 * Examples (count = 5):
 *   1 tag  -> [ 5 ]
 *   2 tags -> [ 3, 2 ]
 *   3 tags -> [ 2, 2, 1 ]
 *   4 tags -> [ 2, 1, 1, 1 ]
 */
const distributeSlots = ( tagCount: number, count: number ): number[] => {
	if ( tagCount <= 0 ) {
		return [];
	}
	const base = Math.floor( count / tagCount );
	const remainder = count % tagCount;
	return Array.from( { length: tagCount }, ( _, i ) => base + ( i < remainder ? 1 : 0 ) );
};

/**
 * Resolve up to `count` curated blogs for a list of tags.
 *
 * - Tags with no entries in `curatedBlogs` are skipped; the requested count is
 *   filled from the remaining tags so we still return up to `count` blogs when
 *   possible.
 * - Blogs are de-duplicated by `feed_ID` across tags. If duplicates are
 *   dropped, additional blogs are pulled from any tag with remaining capacity
 *   so the final list size still approaches `count`.
 * - Selection within each tag is random; the `random` option allows tests to
 *   inject a deterministic generator.
 */
export const getPackBlogs = (
	tags: string[],
	{ count = 5, curatedBlogs = defaultCuratedBlogs, random = Math.random }: GetPackBlogsOptions = {}
): CuratedBlog[] => {
	if ( ! tags?.length || count <= 0 ) {
		return [];
	}

	// Keep only tags that have at least one curated blog available.
	const availableTags = tags.filter(
		( tag ) => Array.isArray( curatedBlogs[ tag ] ) && curatedBlogs[ tag ].length > 0
	);

	if ( availableTags.length === 0 ) {
		return [];
	}

	// Initial even distribution of slots across available tags.
	const slotsPerTag = distributeSlots( availableTags.length, count );

	// Track remaining (unpicked) blogs per tag so we can refill if needed.
	const remainingByTag: Record< string, CuratedBlog[] > = {};
	availableTags.forEach( ( tag ) => {
		remainingByTag[ tag ] = [ ...curatedBlogs[ tag ] ];
	} );

	const seenFeedIds = new Set< number >();
	const picked: CuratedBlog[] = [];

	const takeFromTag = ( tag: string, n: number ): number => {
		if ( n <= 0 ) {
			return 0;
		}
		const candidates = remainingByTag[ tag ];
		const fresh = pickRandom( candidates, Math.min( n, candidates.length ), random );
		// Remove picked items from the remaining pool regardless of duplicate status.
		fresh.forEach( ( blog ) => {
			const idx = remainingByTag[ tag ].indexOf( blog );
			if ( idx >= 0 ) {
				remainingByTag[ tag ].splice( idx, 1 );
			}
		} );
		let added = 0;
		fresh.forEach( ( blog ) => {
			if ( ! seenFeedIds.has( blog.feed_ID ) ) {
				seenFeedIds.add( blog.feed_ID );
				picked.push( blog );
				added++;
			}
		} );
		return added;
	};

	availableTags.forEach( ( tag, i ) => {
		takeFromTag( tag, slotsPerTag[ i ] );
	} );

	// Top up from any tag with remaining capacity if duplicates or short pools
	// caused us to come up short.
	while ( picked.length < count ) {
		const refillable = availableTags.filter( ( tag ) => remainingByTag[ tag ].length > 0 );
		if ( refillable.length === 0 ) {
			break;
		}
		let addedThisRound = 0;
		for ( const tag of refillable ) {
			if ( picked.length >= count ) {
				break;
			}
			addedThisRound += takeFromTag( tag, 1 );
		}
		if ( addedThisRound === 0 ) {
			break;
		}
	}

	return picked;
};
