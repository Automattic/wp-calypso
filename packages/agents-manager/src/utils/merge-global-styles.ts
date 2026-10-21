import deepmerge from 'deepmerge';

// Deliberately local — `@automattic/global-styles` has a similar merge helper,
// but it would pull editor-only dependencies into the widgets.wp.com bundles.
const replace = < T >( _: T, source: T ): T => source;

/**
 * Merges a style variation over global styles the way applying it does:
 * arrays (palettes, font lists) and `border` objects replace wholesale
 * instead of key-merging. Previews therefore match what applying produces,
 * and the applied record compares equal to the variation when detecting
 * the active selection.
 */
export default function mergeGlobalStyles< T >( base: T, overlay: T ): T {
	return deepmerge( base as object, overlay as object, {
		arrayMerge: replace,
		customMerge: ( key ) => ( key === 'border' ? replace : undefined ),
	} ) as T;
}
