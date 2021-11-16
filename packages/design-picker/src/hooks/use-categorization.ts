import { useI18n } from '@wordpress/react-i18n';
import { SHOW_ALL_SLUG } from '../constants';
import { Category, Design } from '../types';
import { gatherCategories } from '../utils';

export function useCategorization( designs: Design[], showAllFilter: boolean ): Category[] {
	const { __ } = useI18n();

	const categories = gatherCategories( designs );
	if ( showAllFilter && designs.length ) {
		categories.unshift( {
			name: __( 'Show All', __i18n_text_domain__ ),
			slug: SHOW_ALL_SLUG,
		} );
	}

	return categories;
}
