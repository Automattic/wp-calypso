/**
 * WordPress dependencies
 */
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { NormalizedField } from '../../types';
import getClickableItemProps from '../utils/get-clickable-item-props';

function ColumnPrimary< Item >( {
	item,
	level,
	titleField,
	mediaField,
	descriptionField,
	onClickItem,
	isItemClickable,
}: {
	item: Item;
	level?: number;
	titleField?: NormalizedField< Item >;
	mediaField?: NormalizedField< Item >;
	descriptionField?: NormalizedField< Item >;
	onClickItem?: ( item: Item ) => void;
	isItemClickable: ( item: Item ) => boolean;
} ) {
	const clickableProps = getClickableItemProps( {
		item,
		isItemClickable,
		onClickItem,
		className:
			'dataviews-view-table__cell-content-wrapper dataviews-title-field',
	} );
	return (
		<HStack spacing={ 3 } justify="flex-start">
			{ mediaField && (
				<div className="dataviews-view-table__cell-content-wrapper dataviews-column-primary__media">
					<mediaField.render item={ item } />
				</div>
			) }
			<VStack spacing={ 0 }>
				{ titleField && (
					<div { ...clickableProps }>
						{ level !== undefined && (
							<span className="dataviews-view-table__level">
								{ '—'.repeat( level ) }&nbsp;
							</span>
						) }
						<titleField.render item={ item } />
					</div>
				) }
				{ descriptionField && (
					<descriptionField.render item={ item } />
				) }
			</VStack>
		</HStack>
	);
}

export default ColumnPrimary;
