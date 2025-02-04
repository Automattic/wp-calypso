import { FormInputValidation, FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';

class ARecord extends Component {
	static propTypes = {
		fieldValues: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		show: PropTypes.bool.isRequired,
	};

	render() {
		const { fieldValues, isValid, onChange, selectedDomainName, show, translate } = this.props;
		const classes = clsx( { 'is-hidden': ! show } );
		const isNameValid = isValid( 'name' );
		const isDataValid = isValid( 'data' );
		const isTTLValid = isValid( 'ttl' );
		const isAaaaRecord = fieldValues.type === 'AAAA';

		const label = translate( 'Name (optional)', { context: 'DNS record' } );

		const namePlaceholder = translate( 'Enter subdomain', {
			context: 'Placeholder shown when entering the subdomain part of a new DNS record',
		} );
		let dataPlaceholder = translate( 'e.g. %(example)s', {
			args: {
				example: '123.45.78.9',
			},
		} );
		if ( isAaaaRecord ) {
			dataPlaceholder = translate( 'e.g. %(example)s', {
				args: {
					example: '2001:500:84::b',
				},
			} );
		}

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ label }</FormLabel>
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

				<FormFieldset>
					<FormLabel>TTL (time to live)</FormLabel>
					<FormTextInput
						name="ttl"
						isError={ ! isTTLValid }
						onChange={ onChange }
						value={ fieldValues.ttl }
						defaultValue={ 3600 }
						placeholder={ 3600 }
					/>
					{ ! isTTLValid && (
						<FormInputValidation
							text={ translate( 'Invalid TTL value - Use a value between 300 and 86400' ) }
							isError
						/>
					) }
				</FormFieldset>
			</div>
		);
	}
}

export default localize( ARecord );
