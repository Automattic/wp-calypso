import { usePrevious } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useRef, useLayoutEffect } from 'react';
import { DataViews } from 'calypso/components/dataviews';
import { ItemsDataViewsType } from './interfaces';

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

export type ItemsDataViewsProps = {
	data: ItemsDataViewsType< any >;
	isLoading?: boolean;
	className?: string;
};

const ItemsDataViews = ( { data, isLoading = false, className }: ItemsDataViewsProps ) => {
	const translate = useTranslate();
	const scrollContainerRef = useRef< HTMLElement >();
	const previousDataViewsState = usePrevious( data.dataViewsState );

	useLayoutEffect( () => {
		if (
			! scrollContainerRef.current ||
			previousDataViewsState?.type !== data.dataViewsState.type
		) {
			scrollContainerRef.current = document.querySelector( '.dataviews-view-list' ) as HTMLElement;
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
				view={ data.dataViewsState }
				onChangeView={ ( newView ) => data.setDataViewsState( () => newView ) }
				fields={ data.fields }
				search={ data?.enableSearch ?? true }
				searchLabel={ data.searchLabel ?? translate( 'Search' ) }
				actions={ data.actions }
				getItemId={
					data.getItemId ??
					( ( item: any ) => {
						// todo: this item.id assignation is to fix an issue with the DataViews component and item selection. It should be removed once the issue is fixed.
						item.id = data.itemFieldId && getIdByPath( item, data.itemFieldId );
						return item.id;
					} )
				}
				isLoading={ isLoading }
				paginationInfo={ data.pagination }
				defaultLayouts={ data.defaultLayouts }
				selection={ data.selection }
				onChangeSelection={ data.onSelectionChange }
				header={ data.header }
			/>
		</div>
	);
};

export default ItemsDataViews;
