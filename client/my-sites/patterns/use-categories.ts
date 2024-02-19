import { useMemo } from 'react';
import type {
	Category,
	Pattern,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

export default function useCategories( patterns: Pattern[] ) {
	return useMemo( () => {
		const categories = new Map< string, Category >();

		patterns.forEach( ( pattern ) => {
			Object.values( pattern.categories ).forEach( ( category ) => {
				if ( ! categories.has( category.slug ) ) {
					categories.set( category.slug, category );
				}
			} );
		} );

		return Array.from( categories.values() ).sort( ( a, b ) => a.label?.localeCompare( b.label ) );
	}, [ patterns ] );
}
