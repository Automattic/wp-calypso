import deepmerge from 'deepmerge';
import {
	editGlobalStyles,
	getEditedGlobalStyles,
	type GlobalStylesRecord,
	type ThemeJson,
} from './global-styles';
import { isRecord } from './is-record';

interface PaletteColor {
	slug: string;
	color: string;
}

const isPaletteColor = ( value: unknown ): value is PaletteColor =>
	isRecord( value ) && typeof value.slug === 'string' && typeof value.color === 'string';

/**
 * Reads the agent's `settings`/`styles` into the subtrees that carry data, or
 * `undefined` when neither does. The backend sends an empty PHP array for a
 * subtree the model left out, which arrives as `[]` — merging that would
 * replace the subtree — so anything but a plain object with keys is empty.
 */
export function normalizeThemeUpdate( {
	settings,
	styles,
}: {
	settings?: unknown;
	styles?: unknown;
} ): GlobalStylesRecord | undefined {
	const hasData = ( value: unknown ): value is ThemeJson =>
		isRecord( value ) && Object.keys( value ).length > 0;
	const update = {
		...( hasData( settings ) && { settings } ),
		...( hasData( styles ) && { styles } ),
	};

	return Object.keys( update ).length ? update : undefined;
}

// A flat palette (`settings.color.palette: [ … ]`) lands in the `custom`
// palette, where WordPress keeps user-added colors, instead of replacing the
// theme's own.
function nestFlatPalette( settings: ThemeJson ): ThemeJson {
	const color = settings.color;
	if ( ! isRecord( color ) || ! Array.isArray( color.palette ) ) {
		return settings;
	}
	return { ...settings, color: { ...color, palette: { custom: color.palette } } };
}

// Palette entries merge by slug — an updated color keeps its place, a new one
// appends — so repeating an update never duplicates a slug. Every other array
// (font lists, sizes, duotones, gradients) replaces wholesale.
function mergeThemeArrays( target: unknown[], source: unknown[] ): unknown[] {
	if ( ! source.some( isPaletteColor ) ) {
		return source;
	}

	const merged = [ ...target ];
	for ( const color of source ) {
		const index = isPaletteColor( color )
			? merged.findIndex(
					( existing ) => isPaletteColor( existing ) && existing.slug === color.slug
			  )
			: -1;
		if ( index >= 0 ) {
			merged[ index ] = color;
		} else {
			merged.push( color );
		}
	}
	return merged;
}

// A theme update is partial, so nested keys merge — unlike `mergeGlobalStyles`,
// which applies a whole style variation. Untouched subtrees are shared rather
// than cloned, so deepmerge never routes them through `mergeThemeArrays`.
const MERGE_OPTIONS: deepmerge.Options = { arrayMerge: mergeThemeArrays, clone: false };

// PHP encodes an empty object as `[]`, so an array arriving over an object
// subtree is an empty update for it, not a replacement.
MERGE_OPTIONS.customMerge = () => ( target: unknown, source: unknown ) =>
	Array.isArray( source ) && isRecord( target )
		? target
		: deepmerge( target as object, source as object, MERGE_OPTIONS );

function mergeThemeUpdate(
	current: Required< GlobalStylesRecord >,
	update: GlobalStylesRecord
): Required< GlobalStylesRecord > {
	const overlay = update.settings
		? { ...update, settings: nestFlatPalette( update.settings ) }
		: update;

	return deepmerge( current, overlay, MERGE_OPTIONS );
}

/**
 * Applies a normalized update to the editor's global styles, building on the
 * session's unsaved edits. Throws until the global-styles record is loaded, so
 * an edit never lands on an empty record.
 */
export function applyThemeUpdate( update: GlobalStylesRecord ): void {
	const globalStyles = getEditedGlobalStyles();
	if ( ! globalStyles ) {
		throw new Error( 'Global styles are unavailable to edit.' );
	}

	editGlobalStyles( globalStyles.id, mergeThemeUpdate( globalStyles.record, update ) );
}
