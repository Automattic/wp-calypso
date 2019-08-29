/**
 * External dependencies
 */
import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

export default function MultiCheckbox( props ) {
	const { checked, defaultChecked, disabled, onChange, name, options, ...otherProps } = props;

	// Used to store the initial value of the `defaultChecked` prop. Never updated.
	// This is done to avoid changing the active items if the defaults change after the initial render.
	const defaultCheckedOnStart = useRef( defaultChecked );

	const handleChange = useCallback(
		event => {
			const target = event.target;
			let checkedEventValue = checked || defaultCheckedOnStart.current;
			checkedEventValue = checkedEventValue.concat( [ target.value ] ).filter( currentValue => {
				return currentValue !== target.value || target.checked;
			} );

			onChange( {
				value: checkedEventValue,
			} );

			event.stopPropagation();
		},
		[ checked, onChange ]
	);

	const checkedItems = checked || defaultCheckedOnStart.current;
	return (
		<div className="multi-checkbox" { ...otherProps }>
			{ options.map( option => (
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

MultiCheckbox.propTypes = {
	checked: PropTypes.array,
	defaultChecked: PropTypes.array,
	disabled: PropTypes.bool,
	onChange: PropTypes.func,
	options: PropTypes.array.isRequired,
	name: PropTypes.string,
};

MultiCheckbox.defaultProps = {
	defaultChecked: Object.freeze( [] ),
	disabled: false,
	onChange: () => {},
	name: 'multiCheckbox',
};
