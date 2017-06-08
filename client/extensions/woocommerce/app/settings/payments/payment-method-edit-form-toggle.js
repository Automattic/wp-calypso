/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormToggle from 'components/forms/form-toggle';

const PaymentMethodEditFormToggle = ( props ) => {
	const { checked, name, onChange } = props;
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
			{ ...omit( props, [ onChange ] ) }
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
