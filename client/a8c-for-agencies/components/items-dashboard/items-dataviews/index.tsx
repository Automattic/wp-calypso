import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { DataViews } from 'calypso/components/dataviews';
import { ItemsDataViewsType, DataViewsColumn } from './interfaces';

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
 * @param header
 * @param displayField
 * @param getValue
 * @param isSortable
 * @param canHide
 */
export const createItemColumn = (
	id: string,
	header: ReactNode,
	displayField: () => ReactNode,
	getValue: () => undefined,
	isSortable: boolean = false,
	canHide: boolean = false
): DataViewsColumn => {
	return {
		id,
		enableSorting: isSortable,
		enableHiding: canHide,
		getValue,
		header,
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

	// Until the DataViews package is updated to support the spinner, we need to manually add the (loading) spinner to the table wrapper for now.
	// todo: The DataViews v0.9 has the spinner support. Remove this once we upgrade the package.
	// Disabling this for now, as manipulating the DOM on the React tree completely breaks the point of using React.
	// This generates mismatches and React has to re-render the whole application to recover.
	// When the mismatch happens, the page might break on a unrecoverable state.

	/*
	const SpinnerWrapper = () => {
		return (
			<div className="spinner-wrapper">
				<Spinner />
			</div>
		);
	};
  const dataviewsWrapper = document.getElementsByClassName( 'dataviews-wrapper' )[ 0 ];
    if ( dataviewsWrapper ) {
        // Remove any existing spinner if present
        const existingSpinner = dataviewsWrapper.querySelector( '.spinner-wrapper' );
        if ( existingSpinner ) {
            existingSpinner.remove();
        }

        const spinnerWrapper = dataviewsWrapper.appendChild( document.createElement( 'div' ) );
        spinnerWrapper.classList.add( 'spinner-wrapper' );
        // Render the SpinnerWrapper component inside the spinner wrapper
        ReactDOM.hydrate( <SpinnerWrapper />, spinnerWrapper );
  }
 */
	return (
		<div className={ className }>
			<DataViews
				data={ data.items }
				paginationInfo={ data.pagination }
				fields={ data.fields }
				view={ data.dataViewsState }
				search
				searchLabel={ data.searchLabel ?? translate( 'Search' ) }
				getItemId={
					data.getItemId ??
					( ( item: any ) => {
						// todo: this item.id assignation is to fix an issue with the DataViews component and item selection. It should be removed once the issue is fixed.
						item.id = data.itemFieldId && getIdByPath( item, data.itemFieldId );
						return item.id;
					} )
				}
				onChangeView={ data.setDataViewsState }
				supportedLayouts={ [ 'table' ] }
				actions={ data.actions }
				isLoading={ isLoading }
			/>
		</div>
	);
};

export default ItemsDataViews;
