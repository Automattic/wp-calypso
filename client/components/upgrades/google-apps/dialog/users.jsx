/**
 * External dependencies
 */
var React = require( 'react' ),
	clone = require( 'lodash/clone' );

/**
 * Internal dependencies
 */
var AnalyticsMixin = require( 'lib/mixins/analytics' );

var GoogleAppsUsers = React.createClass( {
	mixins: [ AnalyticsMixin( 'googleApps' ) ],

	componentWillMount: function() {
		this.props.onChange( this.props.fields ? this.props.fields : this.getInitialFields() );
	},

	getInitialFields: function() {
		return [ this.getNewUserFields() ];
	},

	getNewUserFields: function() {
		return {
			email: { value: '', error: null },
			firstName: { value: '', error: null },
			lastName: { value: '', error: null }
		};
	},

	render: function() {
		var fields = this.props.fields || this.getInitialFields(),
			allUserInputs = fields.map( this.inputsForUser );

		return (
			<div className='google-apps-dialog__users' key='google-apps-dialog__users'>
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
		var domain = this.props.domain;

		return (
			<fieldset className="google-apps-dialog__user-fields" key={ index }>
				<input
					className={ this.fieldClasses( user.email, 'google-apps-dialog__user-email' ) }
					type="text"
					placeholder={ this.translate( 'e.g. contact@%(domain)s', {
						args: { domain: domain }
					} ) }
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

	recordInputFocus: function( index, fieldName ) {
		var field = this.props.fields[ index ],
			inputValue = field ? field.value : '';

		this.recordEvent( 'inputFocus', index, fieldName, inputValue );
	},

	addUser: function( event ) {
		event.preventDefault();

		this.recordEvent( 'addUserClick', this.props.analyticsSection );

		var updatedFields = this.props.fields.concat( [ this.getNewUserFields() ] );
		this.props.onChange( updatedFields );
	},

	updateField: function( index, fieldName, event ) {
		var newValue, updatedFields;
		event.preventDefault();

		newValue = event.target.value;

		updatedFields = clone( this.props.fields );
		updatedFields[ index ] = clone( updatedFields[ index ] );
		updatedFields[ index ][ fieldName ] = clone( updatedFields[ index ][ fieldName ] );
		updatedFields[ index ][ fieldName ].value = newValue;

		this.props.onChange( updatedFields );
	}
} );

module.exports = GoogleAppsUsers;
