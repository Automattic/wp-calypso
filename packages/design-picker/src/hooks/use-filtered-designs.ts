import { useMemo } from 'react';
import { filterDesignsByCategory } from '../utils';
import type { Categorization } from './use-categorization';
import type { Design } from '../types';

export const useFilteredDesigns = ( designs: Design[], categorization?: Categorization ) => {
	const filteredDesigns = useMemo( () => {
		if ( categorization?.selection ) {
			return filterDesignsByCategory( designs, categorization.selection );
		}

		return designs;
	}, [ designs, categorization?.selection ] );

	return filteredDesigns;
};
