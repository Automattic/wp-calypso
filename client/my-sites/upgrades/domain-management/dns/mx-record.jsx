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
			isValid = this.props.isValid,
			isNameValid = isValid( 'name' ),
			isDataValid = isValid( 'data' ),
			isAuxValid = isValid( 'aux' );

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Name', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						placeholder={ this.translate( 'Enter subdomain (optional)', { context: 'Placeholder shown when entering the optional subdomain part of a new DNS record' } ) }
						isError={ ! isNameValid }
						onChange={ this.props.onChange }
						value={ this.props.fieldValues.name }
						suffix={ '.' + this.props.selectedDomainName } />
					{ ! isNameValid ? <FormInputValidation text={ this.translate( 'Invalid Name' ) } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Handled by', { context: 'MX Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="data"
						isError={ ! isDataValid }
						onChange={ this.props.onChange }
						value={ this.props.fieldValues.data }
						placeholder={ this.translate( 'e.g. mail.your-provider.com', { context: 'MX DNS Record', textOnly: true } ) } />
					{ ! isDataValid ? <FormInputValidation text={ this.translate( 'Invalid Mail Server' ) } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Priority', { context: 'MX Dns Record' } ) }</FormLabel>
					<FormTextInput
						name="aux"
						isError={ ! isAuxValid }
						onChange={ this.props.onChange }
						value={ this.props.fieldValues.aux }
						defaultValue="10" />
					{ ! isAuxValid ? <FormInputValidation text={ this.translate( 'Invalid Priority' ) } isError={ true } /> : null }
				</FormFieldset>
			</div>
		);
	}
} );

export default MxRecord;
