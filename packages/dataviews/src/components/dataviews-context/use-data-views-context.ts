/**
 * External dependencies
 */
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViewsContext from './';

export function useDataViewsContext() {
	const context = useContext( DataViewsContext );

	if ( context === undefined ) {
		throw new Error(
			'`useDataViewsContext` must be used within a <DataViews> component.'
		);
	}

	return context;
}
