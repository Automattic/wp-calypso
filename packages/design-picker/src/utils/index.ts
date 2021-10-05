export * from './available-designs-config';
export * from './available-designs';
export * from './fonts';
import type { Category, Design } from '../types';

export function gatherCategories( designs: Design[] ): Category[] {
	const allCategories = new Map(
		designs.flatMap( ( { categories } ) =>
			categories.map( ( { slug, name } ) => [ slug, name ] as [ string, string ] )
		)
	);

	return [ ...allCategories.entries() ].map( ( [ slug, name ] ) => ( { slug, name } ) );
}

export function filterDesignsByCategory(
	designs: Design[],
	selectedCategory: string | null
): Design[] {
	if ( ! selectedCategory ) {
		return designs;
	}

	return designs.filter( ( { categories } ) =>
		categories.find( ( { slug } ) => slug === selectedCategory )
	);
}
