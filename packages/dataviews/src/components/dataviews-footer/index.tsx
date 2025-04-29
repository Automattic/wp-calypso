/**
 * WordPress dependencies
 */
import { __experimentalHStack as HStack } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useDataViewsContext } from '../..';
import DataViewsPagination from '../dataviews-pagination';
import {
	BulkActionsFooter,
	useSomeItemHasAPossibleBulkAction,
} from '../dataviews-bulk-actions';
import { LAYOUT_GRID, LAYOUT_TABLE } from '../../constants';

const EMPTY_ARRAY: [] = [];

export default function DataViewsFooter() {
	const {
		view,
		paginationInfo: { totalItems = 0, totalPages },
		data,
		actions = EMPTY_ARRAY,
	} = useDataViewsContext();
	const hasBulkActions =
		useSomeItemHasAPossibleBulkAction( actions, data ) &&
		[ LAYOUT_TABLE, LAYOUT_GRID ].includes( view.type );

	if (
		! totalItems ||
		! totalPages ||
		( totalPages <= 1 && ! hasBulkActions )
	) {
		return null;
	}
	return (
		!! totalItems && (
			<HStack
				expanded={ false }
				justify="end"
				className="dataviews-footer"
			>
				{ hasBulkActions && <BulkActionsFooter /> }
				<DataViewsPagination />
			</HStack>
		)
	);
}
