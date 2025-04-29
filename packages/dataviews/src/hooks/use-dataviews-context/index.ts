/**
 * External dependencies
 */
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViewsContext from '../../components/dataviews-context';

/**
 * Custom hook to access the DataViews context.
 * Ensures the hook is used within a <DataViews> tree.
 */
export function useDataViewsContext() {
	const context = useContext( DataViewsContext );

	if ( context === undefined ) {
		throw new Error(
			'`useDataViewsContext` must be used within a <DataViews> component.'
		);
	}

	return context;
}
