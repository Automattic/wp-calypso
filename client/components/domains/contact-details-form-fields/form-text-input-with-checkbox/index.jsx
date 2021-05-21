/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Input from 'calypso/my-sites/domains/components/form/input';
import FormLabel from 'calypso/components/forms/form-label';
import FormCheckbox from 'calypso/components/forms/form-checkbox';

/**
 * Style dependencies
 */
import './style.scss';

function FormTextInputWithCheckbox( {
	additionalClasses,
	checkboxLabel,
	checkboxDisabled,
	onCheckboxChanged,
	checkboxDefaultChecked,
	...props
} ) {
	return (
		<div className={ classNames( 'form-text-input-with-checkbox', additionalClasses ) }>
			<Input { ...props } />
			<FormLabel
				className={ classNames( 'form-text-input-with-checkbox__checkbox-label', {
					'is-disabled': checkboxDisabled,
				} ) }
			>
				<FormCheckbox
					name="update-wpcom-email"
					disabled={ checkboxDisabled }
					onChange={ onCheckboxChanged }
					defaultChecked={ checkboxDefaultChecked }
				/>
				<span>{ checkboxLabel }</span>
			</FormLabel>
		</div>
	);
}

FormTextInputWithCheckbox.propTypes = {
	additionalClasses: PropTypes.string,
	checkboxLabel: PropTypes.string,
	checkboxDisabled: PropTypes.bool,
	onCheckboxChanged: PropTypes.func,
	checkboxDefaultChecked: PropTypes.bool,
};

export default FormTextInputWithCheckbox;
