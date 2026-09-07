import deepmerge from 'deepmerge';
import {
	editGlobalStyles,
	type EditedGlobalStyles,
	type GlobalStylesRecord,
	type ThemeJson,
} from './global-styles';
import { isRecord } from './is-record';

const hasSlug = ( value: unknown ): value is { slug: string } =>
	isRecord( value ) && typeof value.slug === 'string';

// Preset entries carry slugs, and WordPress keys each preset list by origin
// (`{ default, theme, custom }`), so a flat list of them belongs under
// `custom` — as does an empty list, which can only clear one the record holds.
function nestPresets( value: ThemeJson, current: unknown ): ThemeJson {
	const nested: ThemeJson = {};
	for ( const [ key, child ] of Object.entries( value ) ) {
		const currentChild = isRecord( current ) ? current[ key ] : undefined;
		if ( Array.isArray( child ) && ( child.every( hasSlug ) || isRecord( currentChild ) ) ) {
			nested[ key ] = { custom: child };
		} else if ( isRecord( child ) ) {
			nested[ key ] = nestPresets( child, currentChild );
		} else {
			nested[ key ] = child;
		}
	}

	return nested;
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
	const keptSettings = prune(
		isRecord( settings ) && nestPresets( settings, current.settings ),
		current.settings
	);
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
