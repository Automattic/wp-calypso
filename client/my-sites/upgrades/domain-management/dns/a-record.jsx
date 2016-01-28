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
			{ fieldValues, isValid, onChange, selectedDomainName } = this.props;
		let placeholder = this.translate( 'e.g. 123.45.78.9', { context: 'A DNS Record', textOnly: true } );

		if ( this.props.fieldValues.type === 'AAAA' ) {
			placeholder = this.translate( 'e.g. 2001:500:84::b', { context: 'AAAA DNS Record', textOnly: true } );
		}

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Name', { context: 'Dns Record' } ) }</FormLabel>
					{ ! isValid( 'name' ) ? <FormInputValidation text={ this.translate( 'Invalid Name' ) } isError={ true } /> : null }
					<FormTextInputWithAffixes
						name="name"
						onChange={ onChange }
						value={ fieldValues.name }
						suffix={ '.' + selectedDomainName } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Points To' ) }</FormLabel>
					{ ! isValid( 'data' ) ? <FormInputValidation text={ this.translate( 'Invalid IP' ) } isError={ true } /> : null }
					<FormTextInput
						name="data"
						onChange={ onChange }
						value={ fieldValues.data }
						placeholder={ placeholder } />
				</FormFieldset>
			</div>
		);
	}
} );

export default ARecord;
