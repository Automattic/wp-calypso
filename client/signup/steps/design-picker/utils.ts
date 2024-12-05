import { SHOW_ALL_SLUG, isBlankCanvasDesign } from '@automattic/design-picker';
import type { Category, Design } from '@automattic/design-picker';

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
