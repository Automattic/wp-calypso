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
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

class MxRecord extends React.Component {
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
		const isAuxValid = isValid( 'aux' );

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
					<FormLabel>{ translate( 'Handled by', { context: 'MX Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="data"
						isError={ ! isDataValid }
						onChange={ onChange }
						value={ fieldValues.data }
						placeholder={ translate( 'e.g. %(example)s', {
							args: { example: 'mail.your-provider.com' },
						} ) }
					/>
					{ ! isDataValid && (
						<FormInputValidation text={ translate( 'Invalid Mail Server' ) } isError />
					) }
					<FormSettingExplanation>
						{ translate(
							'Please use a domain name here (e.g. %(domain)s) - an IP address (e.g. %(ipAddress)s) will {{strong}}not{{/strong}} work.',
							{
								args: {
									domain: 'mail.your-provider.com',
									ipAddress: '123.45.78.9',
								},
								components: {
									strong: <strong />,
								},
								context: "Hint for the 'Handled by' field of a MX record",
							}
						) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Priority', { context: 'MX Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="aux"
						isError={ ! isAuxValid }
						onChange={ onChange }
						value={ fieldValues.aux }
						defaultValue="10"
					/>
					{ ! isAuxValid && (
						<FormInputValidation text={ translate( 'Invalid Priority' ) } isError />
					) }
				</FormFieldset>
			</div>
		);
	}
}

export default localize( MxRecord );
