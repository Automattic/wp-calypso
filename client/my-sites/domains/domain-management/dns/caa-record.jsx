import { FormInputValidation, FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';

class CaaRecord extends Component {
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
		const isFlagsValid = isValid( 'flags' );
		const tagOptions = [ 'issue', 'issuewild', 'issuemail', 'iodef' ].map( ( tag ) => {
			return (
				<option key={ tag } value={ tag }>
					{ tag }
				</option>
			);
		} );
		const isValueValid = isValid( 'value' );
		const isTTLValid = isValid( 'ttl' );

		const namePlaceholder = translate( 'Enter subdomain', {
			context: 'Placeholder shown when entering the subdomain part of a new DNS record',
		} );

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ translate( 'Name (optional)', { context: 'DNS record' } ) }</FormLabel>
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
					<FormLabel>{ translate( 'Flags' ) }</FormLabel>
					<FormTextInput
						name="flags"
						isError={ ! isFlagsValid }
						onChange={ onChange }
						value={ fieldValues.flags }
						defaultValue={ 0 }
						placeholder={ 0 }
					/>
					{ ! isFlagsValid && (
						<FormInputValidation text={ translate( 'Invalid flags' ) } isError />
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Tag' ) }</FormLabel>
					<FormSelect name="tag" onChange={ onChange } value={ fieldValues.tag }>
						{ tagOptions }
					</FormSelect>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Value' ) }</FormLabel>
					<FormTextInput
						name="value"
						isError={ ! isValueValid }
						onChange={ onChange }
						value={ fieldValues.value }
						placeholder={ translate( 'e.g. letsencrypt.org' ) }
					/>
					{ ! isValueValid && (
						<FormInputValidation text={ translate( 'Invalid value' ) } isError />
					) }
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

export default localize( CaaRecord );
