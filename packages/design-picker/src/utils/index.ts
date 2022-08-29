export * from './available-designs-config';
export * from './available-designs';
export * from './designs';
export * from './fonts';
import { isEnabled } from '@automattic/calypso-config';
import { SHOW_ALL_SLUG, STANDARD_THEMES_V13N_WHITELIST } from '../constants';
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

export function isDesignAvailableForV13N( stylesheet: string ): boolean {
	return (
		isEnabled( 'signup/standard-theme-v13n' ) &&
		!! stylesheet &&
		!! STANDARD_THEMES_V13N_WHITELIST.find( ( theme ) => stylesheet?.startsWith( theme ) )
	);
}
