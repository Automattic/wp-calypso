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
import FormTextInput from 'components/forms/form-text-input';

const MxRecord = React.createClass( {
	statics: {
		initialFields: {
			name: '',
			data: '',
			aux: 10
		}
	},

	propTypes: {
		fieldValues: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		show: React.PropTypes.bool.isRequired
	},

	fieldNames: [ 'name', 'data', 'aux' ],

	render() {
		const classes = classnames( { 'is-hidden': ! this.props.show } ),
			isValid = this.props.isValid;

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Host', { context: 'MX Dns Record' } ) }</FormLabel>
					{ ! isValid( 'name' ) ? <FormInputValidation text={ this.translate( 'Invalid Name' ) } isError="true" /> : null }
					<FormTextInput
						name="name"
						onChange={ this.props.onChange( 'name' ) }
						value={ this.props.fieldValues.name }
						placeholder={ this.translate( 'e.g. example.%(domain)s', { args: { domain: this.props.selectedDomainName }, context: 'DNS Record', textOnly: true } ) } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Handled by', { context: 'MX Dns Record' } ) }</FormLabel>
					{ ! isValid( 'data' ) ? <FormInputValidation text={ this.translate( 'Invalid Mail Server' ) } isError="true" /> : null }
					<FormTextInput
						name="data"
						onChange={ this.props.onChange( 'data' ) }
						value={ this.props.fieldValues.data }
						placeholder={ this.translate( 'e.g. mail.my-provider.com', { context: 'MX DNS Record', textOnly: true } ) } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Priority', { context: 'MX Dns Record' } ) }</FormLabel>
					{ ! isValid( 'aux' ) ? <FormInputValidation text={ this.translate( 'Invalid Priority' ) } isError="true" /> : null }
					<FormTextInput
						name="aux"
						onChange={ this.props.onChange( 'aux' ) }
						value={ this.props.fieldValues.aux }
						defaultValue="10" />
				</FormFieldset>
			</div>
		);
	}
} );

export default MxRecord;
