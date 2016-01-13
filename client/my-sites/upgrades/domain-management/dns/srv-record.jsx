/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

const SrvRecord = React.createClass( {
	statics: {
		initialFields: {
			name: '',
			service: '',
			aux: 10,
			weight: 10,
			target: '',
			port: '',
			protocol: 'tcp'
		}
	},

	propTypes: {
		fieldValues: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		show: React.PropTypes.bool.isRequired
	},

	render() {
		const classes = classnames( { 'is-hidden': ! this.props.show } ),
			options = [ 'tcp', 'udp', 'tls' ].map( function( protocol ) {
				return <option key={ protocol } value={ protocol }>{ protocol.toUpperCase() }</option>;
			} ),
			{ aux, name, port, protocol, service, target, weight } = this.props.fieldValues,
			isValid = this.props.isValid;

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Name', { context: 'Dns Record' } ) }</FormLabel>
					{ ! isValid( 'name' ) ? <FormInputValidation text={ this.translate( 'Invalid Name' ) } isError={ true } /> : null }
					<FormTextInputWithAffixes
						name="name"
						onChange={ this.props.onChange( 'name' ) }
						value={ name }
						suffix={ '.' + this.props.selectedDomainName } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Service', { context: 'Dns Record' } ) }</FormLabel>
					{ ! isValid( 'service' ) ? <FormInputValidation text={ this.translate( 'Invalid Service' ) } isError={ true } /> : null }
					<FormTextInput
						name="service"
						onChange={ this.props.onChange( 'service' ) }
						value={ service }
						placeholder={ this.translate( 'e.g. sip', { context: 'SRV Dns Record', textOnly: true } ) } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Protocol', { context: 'Dns Record' } ) }</FormLabel>

					<FormSelect
							name="protocol"
							onChange={ this.props.onChange( 'protocol' ) }
							value={ protocol }>
						{ options }
					</FormSelect>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Priority', { context: 'Dns Record' } ) }</FormLabel>
					{ ! isValid( 'aux' ) ? <FormInputValidation text={ this.translate( 'Invalid Priority' ) } isError={ true } /> : null }
					<FormTextInput
						name="aux"
						onChange={ this.props.onChange( 'aux' ) }
						value={ aux }
						defaultValue="10" />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Weight', { context: 'Dns Record' } ) }</FormLabel>
					{ ! isValid( 'weight' ) ? <FormInputValidation text={ this.translate( 'Invalid Weight' ) } isError={ true } /> : null }
					<FormTextInput
						name="weight"
						onChange={ this.props.onChange( 'weight' ) }
						value={ weight }
						defaultValue="10" />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Target Host', { context: 'Dns Record' } ) }</FormLabel>
					{ ! isValid( 'target' ) ? <FormInputValidation text={ this.translate( 'Invalid Target Host' ) } isError={ true } /> : null }
					<FormTextInput
						name="target"
						onChange={ this.props.onChange( 'target' ) }
						value={ target }
						placeholder={ this.translate( 'e.g. sip.myprovider.com', { context: 'SRV Dns Record', textOnly: true } ) } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Target Port', { context: 'Dns Record' } ) }</FormLabel>
					{ ! isValid( 'port' ) ? <FormInputValidation text={ this.translate( 'Invalid Target Port' ) } isError={ true } /> : null }
					<FormTextInput
						name="port"
						onChange={ this.props.onChange( 'port' ) }
						value={ port }
						placeholder={ this.translate( 'e.g. 5060', { context: 'SRV Dns Record', textOnly: true } ) } />
				</FormFieldset>
			</div>
		);
	}
} );

export default SrvRecord;
