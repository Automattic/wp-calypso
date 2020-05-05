/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

class APIKeysView extends Component {
	static propTypes = {
		highlightEmptyFields: PropTypes.bool,
		onEdit: PropTypes.func.isRequired,
		keys: PropTypes.arrayOf(
			PropTypes.shape( {
				id: PropTypes.string.isRequired,
				label: PropTypes.string,
				placeholder: PropTypes.string,
				value: PropTypes.string,
			} )
		),
	};

	renderOneKey = ( key ) => {
		const { highlightEmptyFields, onEdit, translate } = this.props;
		const isError = highlightEmptyFields && ! key.value.trim();
		const requiredFieldText = translate( 'This field is required.' );

		return (
			<FormFieldset className="api-keys-view__key-container" key={ key.id }>
				<FormLabel required={ true }>{ key.label }</FormLabel>
				<FormTextInput
					isError={ isError }
					name={ key.id }
					onChange={ onEdit }
					value={ key.value }
					placeholder={ key.placeholder }
				/>
				{ isError && <FormInputValidation isError text={ requiredFieldText } /> }
			</FormFieldset>
		);
	};

	render = () => {
		const { keys } = this.props;
		if ( ! keys.length ) {
			return null;
		}

		return <div className="api-keys-view__container">{ keys.map( this.renderOneKey ) }</div>;
	};
}

export default localize( APIKeysView );
