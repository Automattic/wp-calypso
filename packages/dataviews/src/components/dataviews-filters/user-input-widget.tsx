/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import {
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { useDebouncedInput } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { OPERATOR_IS, OPERATOR_IS_NOT } from '../../constants';
import type { View, NormalizedFilter, Filter } from '../../types';


const singleSelectionOperators = [
	OPERATOR_IS,
	OPERATOR_IS_NOT,
];

interface UserInputWidgetProps {
	view: View;
	filter: NormalizedFilter;
	onChangeView: ( view: View ) => void;
}

interface SingleInputSummaryProps {
	view: View;
	filter: NormalizedFilter;
	onChangeView: ( view: View ) => void;
	currentFilter: Filter;
}

interface CreateNewFiltersArgs {
	view: { filters?: Filter[] };
	filter: NormalizedFilter;
	currentFilter: Filter | undefined;
	value: any;
	valueGetter?: (
		filter: NormalizedFilter,
		currentFilter: Filter | undefined,
		value: any
	) => any;
}

/**
 * Updates or adds a filter in the view's filters array.
 * If currentFilter exists, updates its value and operator; otherwise, adds a new filter.
 * Optionally transforms the value using valueGetter.
 */
function applyFilterChange( {
	view,
	filter,
	currentFilter,
	value,
	valueGetter = ( _filter, _currentFilter, val ) => val,
}: CreateNewFiltersArgs ) {
	const processedValue = valueGetter( filter, currentFilter, value ) || undefined;

	if ( currentFilter ) {
		return (view.filters ?? []).map((_filter) =>
			_filter.field === filter.field
				? {
					..._filter,
					operator: currentFilter.operator || filter.operators[0],
					value: processedValue,
				}
				: _filter
		);
	}

	return [
		...(view.filters ?? []),
		{
			field: filter.field,
			operator: filter.operators[0],
			value: processedValue,
		},
	];
};

function SingleInputSummary( { view, filter, onChangeView, currentFilter }: SingleInputSummaryProps ) {
	const currentValue = currentFilter.value;
	const [ value, setValue, debouncedValue ] =
		useDebouncedInput( currentValue );

	useEffect( () => {
		if ( debouncedValue === currentValue ) {
			return;
		}

		const newFilters = applyFilterChange( {
			view,
			filter,
			currentFilter,
			value: debouncedValue,
		} );

		onChangeView( {
			...view,
			page: 1,
			filters: newFilters,
		} );
	}, [ debouncedValue, currentValue ] );

	return (
		<NumberControl
			__next40pxDefaultSize
			value={ value }
			onChange={ ( nextValue ) => {
				setValue( nextValue || '' );
			} }
			step={ 1 }
			min={ 0 }
			placeholder={ __( 'Type value' ) }
		/>
	);
};

export default function UserInputWidget( {
	filter,
	view,
	onChangeView,
}: UserInputWidgetProps ) {
	const activeFilter = view.filters?.find(
		( f ) => f.field === filter.field
	);

	return (
		<div className="dataviews-filters__user-input-widget">
			{ ( () => {
				if (
					activeFilter &&
					singleSelectionOperators.includes( activeFilter.operator )
				) {
					return (
						<SingleInputSummary
							view={ view }
							filter={ filter }
							currentFilter={ activeFilter }
							onChangeView={ onChangeView }
						/>
					);
				}


				// TODO: Implement the rest of the filter types.
				return null;
			} )() }
		</div>
	);
}
