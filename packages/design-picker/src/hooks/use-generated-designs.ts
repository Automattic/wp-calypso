import { useMemo } from 'react';
import rawGeneratedDesignsConfig from '../generated-designs-config.json';
import { Category, Design } from '../types';

export function useGeneratedDesigns( category?: Category ): Design[] {
	// TODO: fetch designs from backend
	return useMemo( () => {
		if ( ! category ) {
			return [];
		}
		return ( rawGeneratedDesignsConfig as Design[] ).map( ( design ) => ( {
			...design,
			categories: [ ...design.categories, category ],
		} ) );
	}, [ category ] );
}
