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
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

const CnameRecord = React.createClass( {
	statics: {
		initialFields: {
			name: '',
			data: ''
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
			isValid = this.props.isValid,
			isNameValid = isValid( 'name' ),
			isDataValid = isValid( 'data' );

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Host', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						isError={ ! isNameValid }
						onChange={ this.props.onChange }
						value={ this.props.fieldValues.name }
						suffix={ '.' + this.props.selectedDomainName } />
					{ ! isNameValid ? <FormInputValidation text={ this.translate( 'Invalid Name' ) } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Alias Of' ) }</FormLabel>
					<FormTextInput
						name="data"
						isError={ ! isDataValid }
						onChange={ this.props.onChange }
						value={ this.props.fieldValues.data }
						placeholder={ this.translate( 'e.g. mydomain.com', { context: 'CName DNS Record', textOnly: true } ) } />
					{ ! isDataValid ? <FormInputValidation text={ this.translate( 'Invalid Target Host' ) } isError={ true } /> : null }
				</FormFieldset>
			</div>
		);
	}
} );

export default CnameRecord;
