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
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';

class CnameRecord extends React.Component {
	static propTypes = {
		fieldValues: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		show: PropTypes.bool.isRequired,
	};

	render() {
		const { fieldValues, isValid, onChange, selectedDomainName, show, translate } = this.props;
		const classes = classnames( { 'is-hidden': ! show } );
		const isNameValid = isValid( 'name' );
		const isDataValid = isValid( 'data' );

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ translate( 'Name (Host)', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						placeholder={ translate( 'Enter subdomain (required)', {
							context:
								'Placeholder shown when entering the required subdomain part of a new DNS record',
						} ) }
						isError={ ! isNameValid }
						onChange={ onChange }
						value={ fieldValues.name }
						suffix={ '.' + selectedDomainName }
					/>
					{ ! isNameValid && <FormInputValidation text={ translate( 'Invalid Name' ) } isError /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Alias Of (Points To)' ) }</FormLabel>
					<FormTextInput
						name="data"
						isError={ ! isDataValid }
						onChange={ onChange }
						value={ fieldValues.data }
						placeholder={ translate( 'e.g. %(example)s', { args: { example: 'example.com' } } ) }
					/>
					{ ! isDataValid && (
						<FormInputValidation text={ translate( 'Invalid Target Host' ) } isError />
					) }
				</FormFieldset>
			</div>
		);
	}
}

export default localize( CnameRecord );
