import { useMemo } from 'react';
import rawGeneratedDesignsConfig from '../generated-designs-config.json';
import { Design } from '../types';

export function useGeneratedDesigns(): Design[] {
	// TODO: fetch designs from backend
	return useMemo( () => {
		return ( rawGeneratedDesignsConfig as Design[] ).map( ( design ) => ( {
			...design,
			preview: 'static',
			categories: [ ...design.categories ],
		} ) );
	}, [] );
}
