import { useMemo } from 'react';
import type { Pattern } from '../types';

const usePatternCountMapByCategory = ( patterns: Pattern[] ) => {
	return useMemo(
		() =>
			patterns.reduce( ( acc: Record< string, number >, pattern ) => {
				const categoryName = pattern.category?.name;
				if ( ! categoryName ) {
					return acc;
				}

				return {
					...acc,
					[ categoryName ]: ( acc[ categoryName ] || 0 ) + 1,
				};
			}, {} ),
		[ patterns ]
	);
};

export default usePatternCountMapByCategory;
