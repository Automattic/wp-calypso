/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { View, NormalizedFilter, NormalizedField } from '../../types';

interface UserInputWidgetProps {
	view: View;
	filter: NormalizedFilter;
	onChangeView: ( view: View ) => void;
	fields: NormalizedField< any >[];
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
	if ( ! field || ! field.Edit ) {
		return null;
	}

	const currentValue = currentFilter.value;

	const data = useMemo( () => {
		return ( view.filters ?? [] ).reduce(
			( acc, f ) => {
				acc[ f.field ] = f.value;
				return acc;
			},
			{} as Record< string, any >
		);
	}, [ view.filters ] );

	const handleChange = useCallback(
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

	return (
		<div className="dataviews-filters__user-input-widget">
			<field.Edit
				data={ data }
				field={ field }
				onChange={ handleChange }
			/>
		</div>
	);
}
