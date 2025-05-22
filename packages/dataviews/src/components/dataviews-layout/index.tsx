/**
 * External dependencies
 */
import type { ComponentType } from 'react';

/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViewsContext from '../dataviews-context';
import { VIEW_LAYOUTS } from '../../dataviews-layouts';
import type { ViewBaseProps } from '../../types';

type DataViewsLayoutProps = {
	className?: string;
};

export default function DataViewsLayout( { className }: DataViewsLayoutProps ) {
	const {
		actions = [],
		data,
		fields,
		getItemId,
		getItemLevel,
		isLoading,
		view,
		onChangeView,
		selection,
		onChangeSelection,
		setOpenedFilter,
		onClickItem,
		isItemClickable,
		renderItemLink,
	} = useContext( DataViewsContext );

	const ViewComponent = VIEW_LAYOUTS.find( ( v ) => v.type === view.type )
		?.component as ComponentType< ViewBaseProps< any > >;

	return (
		<ViewComponent
			className={ className }
			actions={ actions }
			data={ data }
			fields={ fields }
			getItemId={ getItemId }
			getItemLevel={ getItemLevel }
			isLoading={ isLoading }
			onChangeView={ onChangeView }
			onChangeSelection={ onChangeSelection }
			selection={ selection }
			setOpenedFilter={ setOpenedFilter }
			onClickItem={ onClickItem }
			renderItemLink={ renderItemLink }
			isItemClickable={ isItemClickable }
			view={ view }
		/>
	);
}
