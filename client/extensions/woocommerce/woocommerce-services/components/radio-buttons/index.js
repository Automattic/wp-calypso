/* eslint-disable react/no-danger */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import sanitizeHTML from 'woocommerce/woocommerce-services/lib/utils/sanitize-html';
import FieldDescription from 'woocommerce/woocommerce-services/components/field-description';

import './style.scss';

const RadioButton = ( { value, currentValue, setValue, description } ) => {
	const onChange = () => setValue( value );

	return (
		<FormLabel>
			<FormRadio value={ value } checked={ value === currentValue } onChange={ onChange } />
			<div
				// eslint-disable-next-line wpcalypso/jsx-classname-namespace
				className="woocommerce-services-radio-buttons__description"
				dangerouslySetInnerHTML={ sanitizeHTML( description ) }
			/>
		</FormLabel>
	);
};

const RadioButtons = ( { valuesMap, title, description, value, setValue, className } ) => {
	return (
		<FormFieldset className={ className }>
			<FormLegend dangerouslySetInnerHTML={ sanitizeHTML( title ) } />
			<FieldDescription text={ description } />
			{ Object.keys( valuesMap ).map( ( key ) => {
				return (
					<RadioButton
						key={ key }
						value={ key }
						currentValue={ value }
						setValue={ setValue }
						description={ valuesMap[ key ] }
					/>
				);
			} ) }
		</FormFieldset>
	);
};

RadioButtons.propTypes = {
	valuesMap: PropTypes.object.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	value: PropTypes.string.isRequired,
	setValue: PropTypes.func.isRequired,
	className: PropTypes.string,
};

export default RadioButtons;
