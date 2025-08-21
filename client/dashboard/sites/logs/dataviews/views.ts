import { LogType, FilterType } from '../../../data/site-logs';
import type { View } from '@wordpress/dataviews';

const getFilterParamsFromView = ( view: View, fieldNames: string[] ): FilterType => {
	return ( view.filters || [] )
		.filter( ( filter ) => fieldNames.includes( filter.field ) )
		.reduce( ( acc: FilterType, filter ) => {
			if ( filter.value ) {
				acc[ filter.field ] = filter.value;
			}
			return acc;
		}, {} as FilterType );
};

export function toFilterParams( { view, logType }: { view: View; logType: LogType } ): FilterType {
	if ( logType === LogType.PHP ) {
		return getFilterParamsFromView( view, [ 'severity' ] );
	}

	return getFilterParamsFromView( view, [ 'cached', 'request_type', 'status', 'renderer' ] );
}
