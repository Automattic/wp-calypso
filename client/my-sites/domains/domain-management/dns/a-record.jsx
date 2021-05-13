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

class ARecord extends React.Component {
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
		const isAaaaRecord = fieldValues.type === 'AAAA';

		let namePlaceholder = translate( 'Enter subdomain (optional)', {
			context: 'Placeholder shown when entering the optional subdomain part of a new DNS record',
		} );
		let dataPlaceholder = translate( 'e.g. %(example)s', {
			args: {
				example: '123.45.78.9',
			},
		} );

		if ( isAaaaRecord ) {
			namePlaceholder = translate( 'Enter subdomain (required)', {
				context: 'Placeholder shown when entering the required subdomain part of a new DNS record',
			} );
			dataPlaceholder = translate( 'e.g. %(example)s', {
				args: {
					example: '2001:500:84::b',
				},
			} );
		}

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ translate( 'Name', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						placeholder={ namePlaceholder }
						isError={ ! isNameValid }
						onChange={ onChange }
						value={ fieldValues.name }
						suffix={ '.' + selectedDomainName }
					/>
					{ ! isNameValid && <FormInputValidation text={ translate( 'Invalid Name' ) } isError /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Points To' ) }</FormLabel>
					<FormTextInput
						name="data"
						isError={ ! isDataValid }
						onChange={ onChange }
						value={ fieldValues.data }
						placeholder={ dataPlaceholder }
					/>
					{ ! isDataValid && <FormInputValidation text={ translate( 'Invalid IP' ) } isError /> }
				</FormFieldset>
			</div>
		);
	}
}

export default localize( ARecord );
