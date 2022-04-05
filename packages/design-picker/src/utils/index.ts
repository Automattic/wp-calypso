export * from './available-designs-config';
export * from './available-designs';
export * from './categorization-options';
export * from './fonts';
import { SHOW_ALL_SLUG } from '../constants';
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
		( { categories, showFirst } ) =>
			showFirst || categories.find( ( { slug } ) => slug === categorySlug )
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

// Ensures Blog category appears at the top of the design category list
// (directly below the All Themes category).
export function sortBlogCategoryToTop( a: Category, b: Category ) {
	if ( a.slug === b.slug ) {
		return 0;
	} else if ( a.slug === 'blog' ) {
		return -1;
	} else if ( b.slug === 'blog' ) {
		return 1;
	}
	return 0;
}
// Ensures store category appears at the top of the design category list
// (directly below the All Themes category).
export function sortStoreCategoryToTop( a: Category, b: Category ) {
	if ( a.slug === b.slug ) {
		return 0;
	} else if ( a.slug === 'store' ) {
		return -1;
	} else if ( b.slug === 'store' ) {
		return 1;
	}
	return 0;
}

export function sortLocalServicesToTop( a: Category, b: Category ) {
	if ( a.slug === b.slug ) {
		return 0;
	} else if ( a.slug === 'local-services' ) {
		return -1;
	} else if ( b.slug === 'local-services' ) {
		return 1;
	}
	return 0;
}
