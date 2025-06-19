/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo } from '@wordpress/element';
import { Flex } from '@wordpress/components';
import fastDeepEqual from 'fast-deep-equal/es6';

/**
 * Internal dependencies
 */
import type { View, NormalizedFilter, NormalizedField } from '../../types';
import { getCurrentValue } from './utils';

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

	const currentValue = getCurrentValue( filter, currentFilter );

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
			if ( fastDeepEqual( nextValue, currentValue ) ) {
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
		[ field, onChangeView, view, filter, currentFilter ]
	);

	return (
		<Flex
			className="dataviews-filters__user-input-widget"
			gap={ 2.5 }
			direction="column"
		>
			<field.Edit
				hideLabelFromVision={ true }
				data={ data }
				field={ field }
				operator={ currentFilter.operator }
				onChange={ handleChange }
			/>
		</Flex>
	);
}
