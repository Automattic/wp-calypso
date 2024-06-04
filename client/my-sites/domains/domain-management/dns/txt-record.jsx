import { FormInputValidation, FormLabel } from '@automattic/components';
import { DNS_TXT_RECORD_CHAR_LIMIT } from '@automattic/urls';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ExternalLink from 'calypso/components/external-link';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import FormTextarea from 'calypso/components/forms/form-textarea';

class TxtRecord extends Component {
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
		} else if ( value?.length > 2048 ) {
			return translate(
				'TXT records may not exceed 2048 characters. {{supportLink}}Learn more{{/supportLink}}.',
				{
					components: {
						supportLink: (
							<ExternalLink href={ DNS_TXT_RECORD_CHAR_LIMIT } target="_blank" icon={ false } />
						),
					},
				}
			);
		}

		return null;
	}

	render() {
		const { fieldValues, isValid, onChange, selectedDomainName, show, translate } = this.props;
		const classes = clsx( { 'is-hidden': ! show } );
		const isNameValid = isValid( 'name' );
		const isDataValid = isValid( 'data' );
		const isTTLValid = isValid( 'ttl' );
		// eslint-disable-next-line no-control-regex
		const hasNonAsciiData = /[^\u0000-\u007f]/.test( fieldValues.data );
		const validationError = this.getValidationErrorMessage( fieldValues.data );

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ translate( 'Name (optional)', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						placeholder={ translate( 'Enter subdomain', {
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

export default localize( TxtRecord );
