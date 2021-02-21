/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextarea from 'calypso/components/forms/form-textarea';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';

class TxtRecord extends React.Component {
	static propTypes = {
		fieldValues: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		show: PropTypes.bool.isRequired,
	};

	getValidationErrorMessage( value ) {
		const { translate } = this.props;

		if ( value?.length === 0 ) {
			return translate( 'TXT records may not be empty' );
		} else if ( value?.length > 255 ) {
			return translate( 'TXT records may not exceed 255 characters' );
		}

		return null;
	}

	render() {
		const { fieldValues, isValid, onChange, selectedDomainName, show, translate } = this.props;
		const classes = classnames( { 'is-hidden': ! show } );
		const isNameValid = isValid( 'name' );
		const isDataValid = isValid( 'data' );
		// eslint-disable-next-line no-control-regex
		const hasNonAsciiData = /[^\u0000-\u007f]/.test( fieldValues.data );
		const validationError = this.getValidationErrorMessage( fieldValues.data );

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ translate( 'Name', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						placeholder={ translate( 'Enter subdomain (optional)', {
							context:
								'Placeholder shown when entering the optional subdomain part of a new DNS record',
						} ) }
						isError={ ! isNameValid }
						onChange={ onChange }
						value={ fieldValues.name }
						suffix={ '.' + selectedDomainName }
					/>
					{ ! isNameValid && <FormInputValidation text={ translate( 'Invalid Name' ) } isError /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Text', { context: 'Dns Record TXT' } ) }</FormLabel>
					<FormTextarea
						name="data"
						onChange={ onChange }
						value={ fieldValues.data }
						placeholder={ translate( 'e.g. %(example)s', {
							args: { example: 'v=spf1 include:example.com ~all' },
						} ) }
					/>
					{ hasNonAsciiData && (
						<FormInputValidation text={ translate( 'TXT Record has non-ASCII data' ) } isWarning />
					) }
					{ ! isDataValid && validationError && (
						<FormInputValidation text={ validationError } isError />
					) }
				</FormFieldset>
			</div>
		);
	}
}

export default localize( TxtRecord );
