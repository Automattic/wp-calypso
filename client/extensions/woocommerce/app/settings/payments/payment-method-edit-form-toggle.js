/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import FormToggle from 'components/forms/form-toggle';

const PaymentMethodEditFormToggle = ( { checked, name, onChange } ) => {
	const onChangeHandler = () => {
		const fakeEvent = {
			target: {
				name,
				value: checked ? 'no' : 'yes'
			}
		};
		onChange( fakeEvent );
	};

	return (
		<FormToggle
			checked={ checked }
			name={ name }
			onChange={ onChangeHandler } />
	);
};

PaymentMethodEditFormToggle.propTypes = {
	checked: PropTypes.bool,
	name: PropTypes.string,
	onChange: PropTypes.func,
};

export default PaymentMethodEditFormToggle;
