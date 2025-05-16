/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type {
	View,
	NormalizedFilter,
	Filter,
	NormalizedField,
} from '../../types';

interface UserInputWidgetProps {
	view: View;
	filter: NormalizedFilter;
	onChangeView: ( view: View ) => void;
	fields: NormalizedField< any >[];
}

interface SingleInputProps {
	view: View;
	filter: NormalizedFilter;
	onChangeView: ( view: View ) => void;
	currentFilter: Filter;
	field: NormalizedField< any >;
}

function SingleInput( {
	view,
	filter,
	onChangeView,
	currentFilter,
	field,
}: SingleInputProps ) {
	const currentValue = currentFilter.value;

	const onChange = useCallback(
		( data: Record< string, any > ) => {
			const nextValue = data[ field.id ];
			if ( nextValue === currentValue ) {
				return;
			}

			onChangeView( {
				...view,
				filters: ( view.filters ?? [] ).map( ( _filter ) =>
					_filter.field === filter.field
						? {
								..._filter,
								operator:
									currentFilter.operator ||
									filter.operators[ 0 ],
								value: nextValue,
						  }
						: _filter
				),
			} );
		},
		[ currentValue, field, onChangeView, view, filter, currentFilter ]
	);

	if ( ! field.Edit ) {
		return null;
	}

	return (
		<field.Edit
			data={ { [ field.id ]: currentValue } }
			field={ field }
			onChange={ onChange }
		/>
	);
}

export default function InputWidget( {
	filter,
	view,
	onChangeView,
	fields,
}: UserInputWidgetProps ) {
	const currentFilter = view.filters?.find(
		( f ) => f.field === filter.field
	);
	if ( ! currentFilter ) {
		return null;
	}

	const field = fields.find( ( f ) => f.id === filter.field );
	if ( ! field ) {
		return null;
	}

	return (
		<div className="dataviews-filters__user-input-widget">
			<SingleInput
				view={ view }
				filter={ filter }
				currentFilter={ currentFilter }
				onChangeView={ onChangeView }
				field={ field }
			/>
		</div>
	);
}
