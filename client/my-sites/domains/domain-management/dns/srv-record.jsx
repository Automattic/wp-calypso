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
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

class SrvRecord extends React.Component {
	static propTypes = {
		fieldValues: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		show: PropTypes.bool.isRequired,
	};

	render() {
		const { fieldValues, isValid, onChange, selectedDomainName, show, translate } = this.props;
		const classes = classnames( { 'is-hidden': ! show } );
		const options = [ 'tcp', 'udp', 'tls' ].map( ( protocol ) => {
			return (
				<option key={ protocol } value={ protocol }>
					{ protocol.toUpperCase() }
				</option>
			);
		} );
		const { aux, name, port, protocol, service, target, weight } = fieldValues;
		const isNameValid = isValid( 'name' );
		const isServiceValid = isValid( 'service' );
		const isAuxValid = isValid( 'aux' );
		const isWeightValid = isValid( 'weight' );
		const isTargetValid = isValid( 'target' );
		const isPortValid = isValid( 'port' );

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
						value={ name }
						suffix={ '.' + selectedDomainName }
					/>
					{ ! isNameValid && <FormInputValidation text={ translate( 'Invalid Name' ) } isError /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Service', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="service"
						isError={ ! isServiceValid }
						onChange={ onChange }
						value={ service }
						placeholder={ translate( 'e.g. %(example)s', { args: { example: 'sip' } } ) }
					/>
					{ ! isServiceValid && (
						<FormInputValidation text={ translate( 'Invalid Service' ) } isError />
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Protocol', { context: 'Dns Record' } ) }</FormLabel>

					<FormSelect name="protocol" onChange={ onChange } value={ protocol }>
						{ options }
					</FormSelect>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Priority', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="aux"
						isError={ ! isAuxValid }
						onChange={ onChange }
						value={ aux }
						defaultValue="10"
					/>
					{ ! isAuxValid && (
						<FormInputValidation text={ translate( 'Invalid Priority' ) } isError />
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Weight', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="weight"
						isError={ ! isWeightValid }
						onChange={ onChange }
						value={ weight }
						defaultValue="10"
					/>
					{ ! isWeightValid && (
						<FormInputValidation text={ translate( 'Invalid Weight' ) } isError />
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Target Host', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="target"
						isError={ ! isTargetValid }
						onChange={ onChange }
						value={ target }
						placeholder={ translate( 'e.g. %(example)s', {
							args: { example: 'sip.your-provider.com' },
						} ) }
					/>
					{ ! isTargetValid && (
						<FormInputValidation text={ translate( 'Invalid Target Host' ) } isError />
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Target Port', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="port"
						isError={ ! isPortValid }
						onChange={ onChange }
						value={ port }
						placeholder={ translate( 'e.g. %(example)s', { args: { example: '5060' } } ) }
					/>
					{ ! isPortValid && (
						<FormInputValidation text={ translate( 'Invalid Target Port' ) } isError />
					) }
				</FormFieldset>
			</div>
		);
	}
}

export default localize( SrvRecord );
