/**
 * External dependencies
 */
import React, { useCallback, useRef } from 'react';

type OptionValue = number | string;

interface Option {
	value: OptionValue;
	label: string;
}

interface ChangeList {
	value: OptionValue[];
}

interface Props {
	options: Option[];
	checked?: OptionValue[];
	defaultChecked?: OptionValue[];
	onChange?: ( list: ChangeList ) => void;
	disabled?: boolean;
	name?: string;
}

type DivProps = Omit< React.ComponentPropsWithoutRef< 'div' >, 'className' >;

export default function MultiCheckbox( props: Props & DivProps ) {
	const {
		checked,
		defaultChecked = [] as OptionValue[],
		disabled = false,
		onChange = () => {},
		name = 'multiCheckbox',
		options,
		...otherProps
	} = props;

	// Used to store the initial value of the `defaultChecked` prop. Never updated.
	// This is done to avoid changing the active items if the defaults change after the initial render.
	const defaultCheckedOnStart = useRef( defaultChecked );

	const handleChange = useCallback(
		( event ) => {
			const target = event.target;
			let changeEventValue = checked || defaultCheckedOnStart.current;
			changeEventValue = changeEventValue.concat( [ target.value ] ).filter( ( currentValue ) => {
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
				<label key={ option.value }>
					<input
						name={ name + '[]' }
						type="checkbox"
						value={ option.value }
						checked={ checkedItems.includes( option.value ) }
						onChange={ handleChange }
						disabled={ disabled }
					/>
					<span>{ option.label }</span>
				</label>
			) ) }
		</div>
	);
}
