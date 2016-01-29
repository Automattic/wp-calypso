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
			isValid = this.props.isValid,
			isNameValid = isValid( 'name' ),
			isServiceValid = isValid( 'service' ),
			isAuxValid = isValid( 'aux' ),
			isWeightValid = isValid( 'weight' ),
			isTargetValid = isValid( 'target' ),
			isPortValid = isValid( 'port' );

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Name', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						isError={ ! isNameValid }
						onChange={ this.props.onChange }
						value={ name }
						suffix={ '.' + this.props.selectedDomainName } />
					{ ! isNameValid ? <FormInputValidation text={ this.translate( 'Invalid Name' ) } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Service', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="service"
						isError={ ! isServiceValid }
						onChange={ this.props.onChange }
						value={ service }
						placeholder={ this.translate( 'e.g. sip', { context: 'SRV Dns Record', textOnly: true } ) } />
					{ ! isServiceValid ? <FormInputValidation text={ this.translate( 'Invalid Service' ) } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Protocol', { context: 'Dns Record' } ) }</FormLabel>

					<FormSelect
							name="protocol"
							onChange={ this.props.onChange }
							value={ protocol }>
						{ options }
					</FormSelect>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Priority', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="aux"
						isError={ ! isAuxValid }
						onChange={ this.props.onChange }
						value={ aux }
						defaultValue="10" />
					{ ! isAuxValid ? <FormInputValidation text={ this.translate( 'Invalid Priority' ) } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Weight', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="weight"
						isError={ ! isWeightValid }
						onChange={ this.props.onChange }
						value={ weight }
						defaultValue="10" />
					{ ! isWeightValid ? <FormInputValidation text={ this.translate( 'Invalid Weight' ) } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Target Host', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="target"
						isError={ ! isTargetValid }
						onChange={ this.props.onChange }
						value={ target }
						placeholder={ this.translate( 'e.g. sip.myprovider.com', { context: 'SRV Dns Record', textOnly: true } ) } />
					{ ! isTargetValid ? <FormInputValidation text={ this.translate( 'Invalid Target Host' ) } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Target Port', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="port"
						isError={ ! isPortValid }
						onChange={ this.props.onChange }
						value={ port }
						placeholder={ this.translate( 'e.g. 5060', { context: 'SRV Dns Record', textOnly: true } ) } />
					{ ! isPortValid ? <FormInputValidation text={ this.translate( 'Invalid Target Port' ) } isError={ true } /> : null }
				</FormFieldset>
			</div>
		);
	}
} );

export default SrvRecord;
