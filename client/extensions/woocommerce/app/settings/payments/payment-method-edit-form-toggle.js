/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';

const PaymentMethodEditFormToggle = ( props ) => {
	const { checked, name, onChange } = props;
	const onChangeHandler = () => {
		const fakeEvent = {
			target: {
				name,
				value: checked ? 'no' : 'yes',
			},
		};
		onChange( fakeEvent );
	};

	return (
		<CompactFormToggle
			{ ...omit( props, [ 'onChange' ] ) }
			checked={ checked }
			name={ name }
			onChange={ onChangeHandler }
		/>
	);
};

PaymentMethodEditFormToggle.propTypes = {
	checked: PropTypes.bool,
	name: PropTypes.string,
	onChange: PropTypes.func,
};

export default PaymentMethodEditFormToggle;
