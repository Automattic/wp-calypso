import { FormLabel } from '@automattic/components';
import { useCallback, useRef } from 'react';
import * as React from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

type OptionValue = number | string;

interface Option< T = OptionValue > {
	value: T;
	label: string;
}

export interface ChangeList< T = OptionValue > {
	value: T[];
}

interface Props< T = OptionValue > {
	options: Option< T >[];
	checked?: T[];
	defaultChecked?: T[];
	onChange?: ( list: ChangeList< T > ) => void;
	disabled?: boolean;
	name?: string;
}

type DivProps = Omit< React.ComponentPropsWithoutRef< 'div' >, 'className' >;

export default function MultiCheckbox< T extends string | number >( props: Props< T > & DivProps ) {
	const {
		checked,
		defaultChecked = [],
		disabled = false,
		onChange = noop,
		name = 'multiCheckbox',
		options,
		...otherProps
	} = props;

	// Used to store the initial value of the `defaultChecked` prop. Never updated.
	// This is done to avoid changing the active items if the defaults change after the initial render.
	const defaultCheckedOnStart = useRef( defaultChecked );

	const handleChange = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			const target = event.target;
			let changeEventValue = checked || defaultCheckedOnStart.current;
			changeEventValue = changeEventValue
				.concat( [ target.value as T ] )
				.filter( ( currentValue ) => {
					return currentValue !== target.value || target.checked;
				} );

			if ( onChange ) {
				onChange( { value: changeEventValue } );
			}

			event.stopPropagation();
		},
		[ checked, onChange ]
	);

	const checkedItems = checked || defaultCheckedOnStart.current;
	return (
		<div className="multi-checkbox" { ...otherProps }>
			{ options.map( ( option ) => (
				<FormLabel key={ option.value }>
					<FormInputCheckbox
						name={ name + '[]' }
						value={ option.value }
						checked={ checkedItems.includes( option.value ) }
						onChange={ handleChange }
						disabled={ disabled }
					/>
					<span>{ option.label }</span>
				</FormLabel>
			) ) }
		</div>
	);
}
