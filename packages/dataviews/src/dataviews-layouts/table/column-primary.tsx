/**
 * External dependencies
 */
import type { ComponentProps, ReactElement } from 'react';

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
import { ItemClickWrapper } from '../utils/item-click-wrapper';

function ColumnPrimary< Item >( {
	item,
	level,
	titleField,
	mediaField,
	descriptionField,
	onClickItem,
	renderItemLink,
	isItemClickable,
}: {
	item: Item;
	level?: number;
	titleField?: NormalizedField< Item >;
	mediaField?: NormalizedField< Item >;
	descriptionField?: NormalizedField< Item >;
	onClickItem?: ( item: Item ) => void;
	renderItemLink?: (
		props: {
			item: Item;
		} & ComponentProps< 'a' >
	) => ReactElement;
	isItemClickable: ( item: Item ) => boolean;
} ) {
	return (
		<HStack spacing={ 3 } justify="flex-start">
			{ mediaField && (
				<div className="dataviews-view-table__cell-content-wrapper dataviews-column-primary__media">
					<mediaField.render item={ item } field={ mediaField } />
				</div>
			) }
			<VStack spacing={ 0 }>
				{ titleField && (
					<ItemClickWrapper
						item={ item }
						isItemClickable={ isItemClickable }
						onClickItem={ onClickItem }
						renderItemLink={ renderItemLink }
						className="dataviews-view-table__cell-content-wrapper dataviews-title-field"
					>
						{ level !== undefined && (
							<span className="dataviews-view-table__level">
								{ '—'.repeat( level ) }&nbsp;
							</span>
						) }
						<titleField.render item={ item } field={ titleField } />
					</ItemClickWrapper>
				) }
				{ descriptionField && (
					<descriptionField.render
						item={ item }
						field={ descriptionField }
					/>
				) }
			</VStack>
		</HStack>
	);
}

export default ColumnPrimary;
