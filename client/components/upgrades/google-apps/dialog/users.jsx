/**
 * External dependencies
 */
import React from 'react';
import clone from 'lodash/clone';

/**
 * Internal dependencies
 */
import AnalyticsMixin from 'lib/mixins/analytics';

const GoogleAppsUsers = React.createClass( {
	mixins: [ AnalyticsMixin( 'googleApps' ) ],

	componentWillMount() {
		this.props.onChange( this.props.fields ? this.props.fields : this.getInitialFields() );
	},

	getInitialFields() {
		return [ this.getNewUserFields() ];
	},

	getNewUserFields() {
		return {
			email: { value: '', error: null },
			firstName: { value: '', error: null },
			lastName: { value: '', error: null }
		};
	},

	render() {
		const fields = this.props.fields || this.getInitialFields(),
			allUserInputs = fields.map( this.inputsForUser );

		return (
			<div className="google-apps-dialog__users" key="google-apps-dialog__users">
				<h4>{ this.translate( 'New Google Apps User:' ) }</h4>

				{ allUserInputs }

				<button className="google-apps-dialog__add-another-user-button"
						onClick={ this.addUser }>
					{ this.translate( 'Add Another User' ) }
				</button>
			</div>
		);
	},

	fieldClasses: function( field, className ) {
		className = 'google-apps-dialog__user-field ' + className;

		if ( field.error ) {
			className += ' is-invalid';
		}

		return className;
	},

	inputsForUser: function( user, index ) {
		const contactText = this.translate( 'contact', { context: 'part of e-mail address', comment: 'As it would be part of an e-mail address contact@example.com' } ),
			domain = this.props.domain;

		return (
			<fieldset className="google-apps-dialog__user-fields" key={ index }>
				<input
					className={ this.fieldClasses( user.email, 'google-apps-dialog__user-email' ) }
					type="text"
					placeholder={ this.translate( 'e.g. %(example)s', { args: { example: contactText + '@' + domain } } ) }
					value={ user.email.value }
					onChange={ this.updateField.bind( this, index, 'email' ) }
					onBlur={ this.props.onBlur }
					onClick={ this.recordInputFocus.bind( this, index, 'Email' ) } />

				<input
					className={ this.fieldClasses( user.firstName, 'google-apps-dialog__user-first-name' ) }
					type="text"
					placeholder={ this.translate( 'First Name' ) }
					value={ user.firstName.value }
					onChange={ this.updateField.bind( this, index, 'firstName' ) }
					onBlur={ this.props.onBlur }
					onClick={ this.recordInputFocus.bind( this, index, 'First Name' ) } />

				<input
					className={ this.fieldClasses( user.lastName, 'google-apps-dialog__user-last-name' ) }
					type="text"
					placeholder={ this.translate( 'Last Name' ) }
					value={ user.lastName.value }
					onChange={ this.updateField.bind( this, index, 'lastName' ) }
					onBlur={ this.props.onBlur }
					onClick={ this.recordInputFocus.bind( this, index, 'Last Name' ) } />
			</fieldset>
		);
	},

	recordInputFocus( index, fieldName ) {
		const field = this.props.fields[ index ],
			inputValue = field ? field.value : '';

		this.recordEvent( 'inputFocus', index, fieldName, inputValue );
	},

	addUser( event ) {
		event.preventDefault();

		this.recordEvent( 'addUserClick', this.props.analyticsSection );

		const updatedFields = this.props.fields.concat( [ this.getNewUserFields() ] );
		this.props.onChange( updatedFields );
	},

	updateField( index, fieldName, event ) {
		event.preventDefault();

		const newValue = event.target.value,
			updatedFields = clone( this.props.fields );
		updatedFields[ index ] = clone( updatedFields[ index ] );
		updatedFields[ index ][ fieldName ] = clone( updatedFields[ index ][ fieldName ] );
		updatedFields[ index ][ fieldName ].value = newValue;

		this.props.onChange( updatedFields );
	}
} );

export default GoogleAppsUsers;
