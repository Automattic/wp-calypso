import { FormInputValidation, FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';

class SrvRecord extends Component {
	static propTypes = {
		fieldValues: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		show: PropTypes.bool.isRequired,
	};

	render() {
		const { fieldValues, isValid, onChange, selectedDomainName, show, translate } = this.props;
		const classes = clsx( { 'is-hidden': ! show } );
		const options = [ '_tcp', '_udp', '_tls' ].map( ( protocol ) => {
			return (
				<option key={ protocol } value={ protocol }>
					{ protocol }
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
		const isTTLValid = isValid( 'ttl' );

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
					<FormTextInput name="aux" isError={ ! isAuxValid } onChange={ onChange } value={ aux } />
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

export default localize( SrvRecord );
