import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import type { Category } from '../types';

const useAddCategoryAll = ( categories: Category[] ) => {
	const translate = useTranslate();
	return useMemo( () => {
		if ( ! isEnabled( 'pattern-assembler/all-patterns-category' ) ) {
			return categories;
		}
		const categoriesWithAll = categories.map( ( category ) => {
			if ( 'featured' === category.name ) {
				return { ...category, label: translate( 'All' ) };
			}
			return category;
		} );

		return categoriesWithAll;
	}, [ categories ] );
};

export default useAddCategoryAll;
