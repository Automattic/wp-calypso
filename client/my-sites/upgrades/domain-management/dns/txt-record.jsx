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
import FormTextInput from 'components/forms/form-text-input';

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
			isValid = this.props.isValid;

		return (
			<div className={ classes }>
				<FormFieldset>
					<FormLabel>{ this.translate( 'Name', { context: 'Dns Record TXT' } ) }</FormLabel>
					{ ! isValid( 'name' ) ? <FormInputValidation text={ this.translate( 'Invalid Name' ) } isError="true" /> : null }
					<FormTextInput
						name="name"
						onChange={ this.props.onChange( 'name' ) }
						value={ this.props.fieldValues.name }
						placeholder={ this.translate( 'e.g. example.%(domain)s', {
							args: {
								domain: this.props.selectedDomainName
							},
							context: 'TXT Dns Record',
							textOnly: true
						} ) } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ this.translate( 'Text', { context: 'Dns Record TXT' } ) }</FormLabel>
					{ ! isValid( 'data' ) ? <FormInputValidation text={ this.translate( 'Invalid TXT Record' ) } isError="true" /> : null }
					<FormTextarea
						name="data"
						onChange={ this.props.onChange( 'data' ) }
						value={ this.props.fieldValues.data }
						placeholder={ this.translate( 'e.g. a=b; verification-key=something', { context: 'TXT DNS Record', textOnly: true } ) } />
				</FormFieldset>
			</div>
		);
	}
} );

export default TxtRecord;
