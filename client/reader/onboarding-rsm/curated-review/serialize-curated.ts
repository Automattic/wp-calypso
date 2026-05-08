import type { CuratedBlog, CuratedBlogsList } from '../curated-blogs';

export interface CuratedRowMetadata {
	/** Always present — falls back through `feed.feed_URL || feed.URL || entry.site_URL`. */
	feedUrl: string;
	/** `true` iff the resolved feed had a non-empty `image`. */
	hasIcon: boolean;
}

export interface SerializeOptions {
	/** TypeScript identifier of the exported map, e.g. `lifestyleBlogs`. */
	variableName: string;
	/** Tag → entries map, in source order. */
	tagMap: CuratedBlogsList;
	/**
	 * Returns the resolved per-row metadata for a curated entry, or `null` to
	 * omit the entry from the serialized output entirely (e.g. operator-marked
	 * broken). Tags whose entries are all omitted are also dropped from the
	 * output.
	 */
	getMetadata: ( entry: CuratedBlog ) => CuratedRowMetadata | null;
}

/**
 * Emits the full source body of a curated tag file (e.g. `lifestyle.tsx`)
 * with the post-review fields baked in. The output is intentionally close
 * to what prettier produces (tabs, trailing commas, string-quote choice
 * matching the existing files), so a `prettier --write` after paste-back
 * should produce zero whitespace diff.
 *
 * Every emitted entry includes `feedUrl` and `hasIcon`. Entries where
 * `getMetadata` returns `null` are omitted; tags that end up empty as a
 * result are dropped entirely.
 */
export function serializeCurated( {
	variableName,
	tagMap,
	getMetadata,
}: SerializeOptions ): string {
	const tagBlocks: string[] = [];
	for ( const [ tag, entries ] of Object.entries( tagMap ) ) {
		const resolved: { entry: CuratedBlog; metadata: CuratedRowMetadata }[] = [];
		for ( const entry of entries ) {
			const metadata = getMetadata( entry );
			if ( metadata !== null ) {
				resolved.push( { entry, metadata } );
			}
		}
		if ( resolved.length === 0 ) {
			continue;
		}
		tagBlocks.push( serializeTag( tag, resolved ) );
	}

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
	resolved: { entry: CuratedBlog; metadata: CuratedRowMetadata }[]
): string {
	const entryBlocks = resolved.map( ( { entry, metadata } ) => serializeEntry( entry, metadata ) );
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
