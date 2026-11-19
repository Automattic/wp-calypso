import { __ } from '@wordpress/i18n';
import { DataViewsEmptyStateLayout } from '../../components/dataviews';

/**
 * What the Active threats and History lists show when a search or the filters
 * leave nothing to list. A search comes first, as on the other list pages.
 */
export function getNoMatchingThreats( search: string | undefined, hasFilters: boolean ) {
	if ( search ) {
		return (
			<DataViewsEmptyStateLayout
				isBorderless
				title={ __( 'No threats match your search' ) }
				description={ __( 'Try a different search term.' ) }
			/>
		);
	}
	if ( hasFilters ) {
		return (
			<DataViewsEmptyStateLayout
				isBorderless
				title={ __( 'No threats match your filters' ) }
				description={ __( 'Try different filters, or reset them.' ) }
			/>
		);
	}
	return undefined;
}
