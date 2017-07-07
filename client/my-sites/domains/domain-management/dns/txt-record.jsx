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
import FormTextarea from 'components/forms/form-textarea';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

const TxtRecord = React.createClass( {
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

	fieldNames: [ 'name', 'data' ],

	render() {
		const classes = classnames( { 'is-hidden': ! this.props.show } ),
			isValid = this.props.isValid,
			isNameValid = isValid( 'name' ),
			isDataValid = isValid( 'data' ),
			hasNonAsciiData = /[^\u0000-\u007f]/.test( this.props.fieldValues.data );

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Name', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						placeholder={
							this.translate(
								'Enter subdomain (optional)',
								{ context: 'Placeholder shown when entering the optional subdomain part of a new DNS record' }
							)
						}
						isError={ ! isNameValid }
						onChange={ this.props.onChange }
						value={ this.props.fieldValues.name }
						suffix={ '.' + this.props.selectedDomainName } />
					{ ! isNameValid && <FormInputValidation text={ this.translate( 'Invalid Name' ) } isError /> }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Text', { context: 'Dns Record TXT' } ) }</FormLabel>
					<FormTextarea
						name="data"
						onChange={ this.props.onChange }
						value={ this.props.fieldValues.data }
						placeholder={ this.translate( 'e.g. %(example)s', { args: { example: 'v=spf1 include:example.com ~all' } } ) } />
					{ hasNonAsciiData && <FormInputValidation text={ this.translate( 'TXT Record has non-ASCII data' ) } isWarning /> }
					{ ! isDataValid && <FormInputValidation text={ this.translate( 'Invalid TXT Record' ) } isError /> }
				</FormFieldset>
			</div>
		);
	}
} );

export default TxtRecord;
