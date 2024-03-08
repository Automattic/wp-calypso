export * from './available-designs';
export * from './designs';
export * from './global-styles';
export * from './is-locked-style-variation';
import { SHOW_ALL_SLUG } from '../constants';
import { isBlankCanvasDesign } from './available-designs';
import type { Category, Design } from '../types';

export function gatherCategories( designs: Design[] ): Category[] {
	const allCategories = new Map(
		designs.flatMap( ( { categories } ) =>
			categories.map( ( { slug, name } ) => [ slug, name ] as [ string, string ] )
		)
	);

	return [ ...allCategories.entries() ].map( ( [ slug, name ] ) => ( { slug, name } ) );
}

// Returns designs that match the category slug. Designs with `showFirst` are always
// included in every category.
export function filterDesignsByCategory(
	designs: Design[],
	categorySlug: string | null
): Design[] {
	if ( ! categorySlug ) {
		return designs;
	}

	if ( categorySlug === SHOW_ALL_SLUG ) {
		return designs;
	}

	return designs.filter(
		( design ) =>
			design.showFirst ||
			isBlankCanvasDesign( design ) ||
			design.categories.find( ( { slug } ) => slug === categorySlug )
	);
}

// Ensures that designs with `showFirst` appear first.
export function sortDesigns( a: Design, b: Design ): number {
	if ( a.showFirst === b.showFirst ) {
		return 0;
	}
	if ( a.showFirst ) {
		return -1;
	}
	return 1;
}
