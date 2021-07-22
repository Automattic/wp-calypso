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
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';

class CaaRecord extends React.Component {
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
		const isValueValid = isValid( 'value' );
		const isFlagsValid = isValid( 'flags' );

		const options = [ 'issue', 'issuewild' ].map( ( type ) => {
			return (
				<option key={ type } value={ type }>
					{ type }
				</option>
			);
		} );

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
					<FormLabel>{ translate( 'Tag', { context: 'Dns Record' } ) }</FormLabel>

					<FormSelect name="tag" onChange={ onChange } value={ fieldValues.tag }>
						{ options }
					</FormSelect>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Flags', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="flags"
						onChange={ onChange }
						isError={ ! isFlagsValid }
						value={ fieldValues.flags }
					/>
					{ ! isFlagsValid && (
						<FormInputValidation text={ translate( 'Invalid Flags' ) } isError />
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Issuer', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextarea
						name="value"
						onChange={ onChange }
						isError={ ! isValueValid }
						value={ fieldValues.value }
						placeholder={ translate( 'e.g. %(example)s', {
							args: { example: 'letsencrypt.org' },
						} ) }
					/>
					{ ! isValueValid && (
						<FormInputValidation text={ translate( 'Invalid Issuer' ) } isError />
					) }
				</FormFieldset>
			</div>
		);
	}
}

export default localize( CaaRecord );
