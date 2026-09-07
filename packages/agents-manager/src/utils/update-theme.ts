import deepmerge from 'deepmerge';
import {
	editGlobalStyles,
	type EditedGlobalStyles,
	type GlobalStylesRecord,
	type ThemeJson,
} from './global-styles';
import { isRecord } from './is-record';

// Preset lists the record keys by origin (`{ theme, custom }`) but the agent
// sends flat; its entries belong to `custom`.
const PRESET_LISTS = [
	[ 'color', 'palette' ],
	[ 'color', 'duotone' ],
	[ 'color', 'gradients' ],
	[ 'typography', 'fontFamilies' ],
	[ 'typography', 'fontSizes' ],
];

const hasSlug = ( value: unknown ): value is { slug: string } =>
	isRecord( value ) && typeof value.slug === 'string';

function nestPresets( settings: ThemeJson ): ThemeJson {
	return PRESET_LISTS.reduce( ( nested, [ group, list ] ) => {
		const presets = nested[ group ];
		if ( ! isRecord( presets ) || ! Array.isArray( presets[ list ] ) ) {
			return nested;
		}
		return { ...nested, [ group ]: { ...presets, [ list ]: { custom: presets[ list ] } } };
	}, settings );
}

// PHP encodes an empty object as `[]`, so an empty array carries a change only
// where it clears a non-empty list; an object carries one only if a key does.
function prune( value: unknown, current: unknown ): ThemeJson | undefined {
	if ( ! isRecord( value ) ) {
		return undefined;
	}

	const kept: ThemeJson = {};
	for ( const [ key, child ] of Object.entries( value ) ) {
		const currentChild = isRecord( current ) ? current[ key ] : undefined;
		if ( isRecord( child ) ) {
			const keptChild = prune( child, currentChild );
			if ( keptChild ) {
				kept[ key ] = keptChild;
			}
		} else if (
			! Array.isArray( child ) ||
			child.length ||
			( Array.isArray( currentChild ) && currentChild.length )
		) {
			kept[ key ] = child;
		}
	}

	return Object.keys( kept ).length ? kept : undefined;
}

/**
 * Reads the agent's `settings`/`styles` against the current record into the
 * subtrees that carry a change, or `undefined` when neither does.
 */
export function normalizeThemeUpdate(
	{ settings, styles }: { settings?: unknown; styles?: unknown },
	current: GlobalStylesRecord
): GlobalStylesRecord | undefined {
	const keptSettings = prune( isRecord( settings ) && nestPresets( settings ), current.settings );
	const keptStyles = prune( styles, current.styles );
	if ( ! keptSettings && ! keptStyles ) {
		return undefined;
	}

	return {
		...( keptSettings && { settings: keptSettings } ),
		...( keptStyles && { styles: keptStyles } ),
	};
}

// Entries with a slug (colors, fonts, sizes, duotones, gradients) merge by it
// — an updated entry keeps its place, a new one appends — so repeating an
// update never duplicates one. Every other array replaces wholesale.
function mergeThemeArrays( target: unknown[], source: unknown[] ): unknown[] {
	if ( ! source.some( hasSlug ) ) {
		return source;
	}

	const merged = [ ...target ];
	for ( const entry of source ) {
		const index = hasSlug( entry )
			? merged.findIndex( ( existing ) => hasSlug( existing ) && existing.slug === entry.slug )
			: -1;
		if ( index >= 0 ) {
			merged[ index ] = entry;
		} else {
			merged.push( entry );
		}
	}
	return merged;
}

// A theme update is partial, so nested keys merge — unlike `mergeGlobalStyles`,
// which applies a whole style variation. Untouched subtrees are shared rather
// than cloned, so deepmerge never routes them through `mergeThemeArrays`.
const MERGE_OPTIONS: deepmerge.Options = { arrayMerge: mergeThemeArrays, clone: false };

/** Applies a normalized update over the edited global styles. */
export function applyThemeUpdate(
	{ id, record }: EditedGlobalStyles,
	update: GlobalStylesRecord
): void {
	editGlobalStyles( id, deepmerge( record, update, MERGE_OPTIONS ) );
}
