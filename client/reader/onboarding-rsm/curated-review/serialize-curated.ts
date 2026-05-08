import type { CuratedBlog, CuratedBlogsList } from '../curated-blogs';

export interface CuratedRowMetadata {
	/** Always present — falls back through `feed.feed_URL || feed.URL || entry.site_URL`. */
	feedUrl: string;
	/** `true` iff the resolved feed had a non-empty `image`. */
	hasIcon: boolean;
	/** Only emitted when `true` (auto-flagged on feed error / missing feed_URL, or user-toggled). */
	isBroken?: boolean;
}

export interface SerializeOptions {
	/** TypeScript identifier of the exported map, e.g. `lifestyleBlogs`. */
	variableName: string;
	/** Tag → entries map, in source order. */
	tagMap: CuratedBlogsList;
	/** Returns the resolved per-row metadata for a curated entry. */
	getMetadata: ( entry: CuratedBlog ) => CuratedRowMetadata;
}

/**
 * Emits the full source body of a curated tag file (e.g. `lifestyle.tsx`)
 * with the post-review fields baked in. The output is intentionally close
 * to what prettier produces (tabs, trailing commas, string-quote choice
 * matching the existing files), so a `prettier --write` after paste-back
 * should produce zero whitespace diff.
 *
 * Every emitted entry includes `feedUrl` and `hasIcon`. `isBroken` is only
 * emitted when `true`. Field order matches the original source.
 */
export function serializeCurated( {
	variableName,
	tagMap,
	getMetadata,
}: SerializeOptions ): string {
	const tagBlocks = Object.entries( tagMap ).map( ( [ tag, entries ] ) =>
		serializeTag( tag, entries, getMetadata )
	);

	return [
		"import { CuratedBlogsList } from './index';",
		'',
		`export const ${ variableName }: CuratedBlogsList = {`,
		...tagBlocks,
		'};',
		'',
	].join( '\n' );
}

function serializeTag(
	tag: string,
	entries: CuratedBlog[],
	getMetadata: ( entry: CuratedBlog ) => CuratedRowMetadata
): string {
	const entryBlocks = entries.map( ( entry ) => serializeEntry( entry, getMetadata( entry ) ) );
	return [ `\t${ formatKey( tag ) }: [`, ...entryBlocks, '\t],' ].join( '\n' );
}

function serializeEntry( entry: CuratedBlog, metadata: CuratedRowMetadata ): string {
	const lines: string[] = [
		`\t\t\tfeed_ID: ${ entry.feed_ID },`,
		`\t\t\tsite_ID: ${ entry.site_ID },`,
		`\t\t\tsite_URL: ${ formatString( entry.site_URL ) },`,
		`\t\t\tsite_name: ${ formatString( entry.site_name ) },`,
		`\t\t\tfeedUrl: ${ formatString( metadata.feedUrl ) },`,
		`\t\t\thasIcon: ${ metadata.hasIcon ? 'true' : 'false' },`,
	];
	if ( metadata.isBroken === true ) {
		lines.push( '\t\t\tisBroken: true,' );
	}
	return [ '\t\t{', ...lines, '\t\t},' ].join( '\n' );
}

const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$-]*$/;

function formatKey( key: string ): string {
	// Hyphenated tags like 'k-12' aren't valid bare identifiers; quote those.
	return VALID_IDENTIFIER.test( key ) && ! key.includes( '-' ) ? key : formatString( key );
}

function formatString( value: string ): string {
	const hasSingle = value.includes( "'" );
	const hasDouble = value.includes( '"' );
	if ( hasSingle && ! hasDouble ) {
		return `"${ value }"`;
	}
	if ( hasSingle && hasDouble ) {
		return `'${ value.replace( /\\/g, '\\\\' ).replace( /'/g, "\\'" ) }'`;
	}
	return `'${ value }'`;
}
