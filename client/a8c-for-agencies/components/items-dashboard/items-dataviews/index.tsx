import { Spinner } from '@automattic/components';
import { usePrevious } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { DataViews } from 'calypso/components/dataviews';
import { ItemsDataViewsType } from './interfaces';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

const getIdByPath = ( item: object, path: string ) => {
	const fields = path.split( '.' );
	let result: Record< string, any > = item;
	for ( const field of fields ) {
		if ( result[ field ] === undefined ) {
			return undefined;
		}
		result = result[ field ];
	}
	return result;
};

/**
 * Create an item column for the DataViews component
 * @param id
 * @param label
 * @param displayField
 * @param getValue
 * @param isSortable
 * @param canHide
 */
export const createItemColumn = (
	id: string,
	label: ReactNode,
	displayField: () => ReactNode,
	getValue: () => undefined,
	isSortable: boolean = false,
	canHide: boolean = false
): Field< any > => {
	return {
		id,
		enableSorting: isSortable,
		enableHiding: canHide,
		getValue,
		// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
		label,
		render: displayField,
	};
};

export type ItemsDataViewsProps = {
	data: ItemsDataViewsType< any >;
	isLoading?: boolean;
	className?: string;
};

const ItemsDataViews = ( { data, isLoading = false, className }: ItemsDataViewsProps ) => {
	const translate = useTranslate();
	const scrollContainerRef = useRef< HTMLElement >();
	const previousDataViewsState = usePrevious( data.dataViewsState );
	const dataviewsWrapper = document.getElementsByClassName( 'dataviews-wrapper' )[ 0 ];

	useLayoutEffect( () => {
		if (
			! scrollContainerRef.current ||
			previousDataViewsState?.type !== data.dataViewsState.type
		) {
			scrollContainerRef.current = document.querySelector(
				'.dataviews-view-list, .dataviews-view-table-wrapper'
			) as HTMLElement;
		}

		if ( ! previousDataViewsState?.selectedItem && data.dataViewsState.selectedItem ) {
			window.setTimeout(
				() => scrollContainerRef.current?.querySelector( 'li.is-selected' )?.scrollIntoView(),
				300
			);
			return;
		}

		if ( previousDataViewsState?.page !== data.dataViewsState.page ) {
			scrollContainerRef.current?.scrollTo( 0, 0 );
		}
	}, [ data.dataViewsState.type, data.dataViewsState.page ] );

	return (
		<div className={ className }>
			<DataViews
				data={ data.items ?? [] }
				paginationInfo={ data.pagination }
				fields={ data.fields }
				view={ data.dataViewsState }
				search={ data?.enableSearch ?? true }
				searchLabel={ data.searchLabel ?? translate( 'Search' ) }
				getItemId={
					data.getItemId ??
					( ( item: any ) => {
						// todo: this item.id assignation is to fix an issue with the DataViews component and item selection. It should be removed once the issue is fixed.
						item.id = data.itemFieldId && getIdByPath( item, data.itemFieldId );
						return item.id;
					} )
				}
				onSelectionChange={ data.onSelectionChange }
				onChangeView={ data.setDataViewsState }
				supportedLayouts={ [ 'table' ] }
				actions={ data.actions }
				isLoading={ isLoading }
			/>
			{ dataviewsWrapper &&
				ReactDOM.createPortal(
					/**
					 * Until the DataViews package is updated to support the spinner, we need to manually add the (loading) spinner to the table wrapper for now.
					 * todo: The DataViews v0.9 has the spinner support. Remove this once we upgrade the package.
					 */
					<div className="spinner-wrapper">
						<Spinner />
					</div>,
					dataviewsWrapper
				) }
		</div>
	);
};

export default ItemsDataViews;
