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

const ARecord = React.createClass( {
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
			{ fieldValues, isValid, onChange, selectedDomainName } = this.props,
			isNameValid = isValid( 'name' ),
			isDataValid = isValid( 'data' ),
			isAaaaRecord = this.props.fieldValues.type === 'AAAA';
		let namePlaceholder = this.translate( 'Enter subdomain (optional)', {
				context: 'Placeholder shown when entering the optional subdomain part of a new DNS record'
			} ),
			dataPlaceholder = this.translate( 'e.g. %(example)s', { args: { example: '123.45.78.9' } } );

		if ( isAaaaRecord ) {
			namePlaceholder = this.translate( 'Enter subdomain (required)', {
				context: 'Placeholder shown when entering the required subdomain part of a new DNS record'
			} ),
			dataPlaceholder = this.translate( 'e.g. %(example)s', { args: { example: '2001:500:84::b' } } );
		}

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Name', { context: 'Dns Record' } ) }</FormLabel>
					<FormTextInputWithAffixes
						name="name"
						placeholder={ namePlaceholder }
						isError={ ! isNameValid }
						onChange={ onChange }
						value={ fieldValues.name }
						suffix={ '.' + selectedDomainName } />
					{ ! isNameValid ? <FormInputValidation text={ this.translate( 'Invalid Name' ) } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Points To' ) }</FormLabel>
					<FormTextInput
						name="data"
						isError={ ! isDataValid }
						onChange={ onChange }
						value={ fieldValues.data }
						placeholder={ dataPlaceholder } />
					{ ! isDataValid ? <FormInputValidation text={ this.translate( 'Invalid IP' ) } isError={ true } /> : null }
				</FormFieldset>
			</div>
		);
	}
} );

export default ARecord;
