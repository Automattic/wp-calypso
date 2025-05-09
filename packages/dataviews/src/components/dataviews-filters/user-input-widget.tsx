/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { useDebouncedInput } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { OPERATOR_IS, OPERATOR_IS_NOT } from '../../constants';
import type { View, NormalizedFilter, Filter } from '../../types';

const singleSelectionOperators = [ OPERATOR_IS, OPERATOR_IS_NOT ];

interface UserInputWidgetProps {
	view: View;
	filter: NormalizedFilter;
	onChangeView: ( view: View ) => void;
}

interface SingleInputSummaryProps {
	view: View;
	filter: NormalizedFilter;
	onChangeView: ( view: View ) => void;
	activeFilter: Filter;
}

interface CreateNewFiltersArgs {
	view: { filters?: Filter[] };
	filter: NormalizedFilter;
	activeFilter: Filter;
	value: string;
}

/**
 * Updates or adds a filter in the view's filters array.
 * If currentFilter exists, updates its value and operator; otherwise, adds a new filter.
 */
function applyFilterChange( {
	view,
	filter,
	activeFilter,
	value,
}: CreateNewFiltersArgs ) {
	const newValue = value === '' ? undefined : Number( value );

	return ( view.filters ?? [] ).map( ( _filter ) =>
		_filter.field === filter.field
			? {
					..._filter,
					operator: activeFilter.operator || filter.operators[ 0 ],
					value: newValue,
			  }
			: _filter
	);
}

function SingleInputSummary( {
	view,
	filter,
	onChangeView,
	activeFilter,
}: SingleInputSummaryProps ) {
	const currentValue = activeFilter.value;
	const [ value, setValue, debouncedValue ] =
		useDebouncedInput( currentValue );

	useEffect( () => {
		if ( debouncedValue === currentValue ) {
			return;
		}

		const newFilters = applyFilterChange( {
			view,
			filter,
			activeFilter,
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
}

export default function UserInputWidget( {
	filter,
	view,
	onChangeView,
}: UserInputWidgetProps ) {
	const activeFilter = view.filters?.find(
		( f ) => f.field === filter.field
	);
	if (
		! activeFilter ||
		! singleSelectionOperators.includes( activeFilter.operator )
	) {
		return null;
	}

	return (
		<div className="dataviews-filters__user-input-widget">
			<SingleInputSummary
				view={ view }
				filter={ filter }
				activeFilter={ activeFilter }
				onChangeView={ onChangeView }
			/>
		</div>
	);
}
