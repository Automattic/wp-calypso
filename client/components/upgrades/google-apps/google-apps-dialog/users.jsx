/**
 * External dependencies
 */
import React from 'react';
import clone from 'lodash/clone';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'state/analytics/actions';

class GoogleAppsUsers extends React.Component {
	componentWillMount() {
		this.props.onChange( this.props.fields ? this.props.fields : this.getInitialFields() );
	}

	getInitialFields() {
		return [ this.getNewUserFields() ];
	}

	getNewUserFields() {
		return {
			email: { value: '', error: null },
			firstName: { value: '', error: null },
			lastName: { value: '', error: null },
			domain: { value: this.props.domain, error: null }
		};
	}

	render() {
		const fields = this.props.fields || this.getInitialFields(),
			allUserInputs = fields.map( this.inputsForUser ),
			{ translate } = this.props;

		return (
			<div className="google-apps-dialog__users" key="google-apps-dialog__users">
				<h4>{ translate( 'New G Suite User:' ) }</h4>

				{ allUserInputs }

				<button className="google-apps-dialog__add-another-user-button"
						onClick={ this.addUser }>
					{ translate( 'Add Another User' ) }
				</button>
			</div>
		);
	}

	fieldClasses( fieldName ) {
		return `google-apps-dialog__user-field google-apps-dialog__user-${ fieldName }`;
	}

	inputsForUser( user, index ) {
		const { translate } = this.props,
			contactText = translate(
				'contact',
				{
					context: 'part of e-mail address',
					comment: 'As it would be part of an e-mail address contact@example.com'
				}
			);

		return (
			<div className="google-apps-dialog__user-fields" key={ `google-apps-dialog-user-${ index }` }>
				<FormFieldset>
					<FormTextInputWithAffixes
						className={ this.fieldClasses( 'email' ) }
						placeholder={ translate( 'e.g. %(example)s', { args: { example: contactText } } ) }
						name="email"
						value={ user.email.value }
						suffix={ '@' + this.props.domain }
						isError={ !! user.email.error }
						onChange={ this.updateField.bind( this, index ) }
						onBlur={ this.props.onBlur }
						onClick={ this.recordInputFocus.bind( this, index, 'Email' ) } />
					{ user.email.error ? <FormInputValidation text={ user.email.error } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset className={ this.fieldClasses( 'first-name' ) }>
					<FormTextInput
						placeholder={ translate( 'First Name' ) }
						name="firstName"
						value={ user.firstName.value }
						maxLength={ 60 }
						isError={ !! user.firstName.error }
						onChange={ this.updateField.bind( this, index ) }
						onBlur={ this.props.onBlur }
						onClick={ this.recordInputFocus.bind( this, index, 'First Name' ) } />
					{ user.firstName.error ? <FormInputValidation text={ user.firstName.error } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset className={ this.fieldClasses( 'last-name' ) }>
					<FormTextInput
						placeholder={ translate( 'Last Name' ) }
						name="lastName"
						value={ user.lastName.value }
						maxLength={ 60 }
						isError={ !! user.lastName.error }
						onChange={ this.updateField.bind( this, index ) }
						onBlur={ this.props.onBlur }
						onClick={ this.recordInputFocus.bind( this, index, 'Last Name' ) } />
					{ user.lastName.error ? <FormInputValidation text={ user.lastName.error } isError={ true } /> : null }
				</FormFieldset>
			</div>
		);
	}

	recordInputFocus( index, fieldName ) {
		const field = this.props.fields[ index ],
			inputValue = field ? field.value : '';

		this.props.recordInputFocus( index, fieldName, inputValue );
	}

	addUser( event ) {
		event.preventDefault();

		this.props.recordAddUserClick( this.props.analyticsSection );

		const updatedFields = this.props.fields.concat( [ this.getNewUserFields() ] );
		this.props.onChange( updatedFields );
	}

	updateField( index, event ) {
		event.preventDefault();

		const fieldName = event.target.name,
			newValue = fieldName === 'email' ? event.target.value.trim() : event.target.value,
			updatedFields = clone( this.props.fields );
		updatedFields[ index ] = clone( updatedFields[ index ] );
		updatedFields[ index ][ fieldName ] = clone( updatedFields[ index ][ fieldName ] );
		updatedFields[ index ][ fieldName ].value = newValue;

		this.props.onChange( updatedFields );
	}
}

const recordAddUserClick = ( section ) => composeAnalytics(
	recordTracksEvent(
		'calypso_google_apps_add_user_button_click',
		{ section }
	),
	recordGoogleEvent(
		'Domain Search',
		'Clicked "Add User" Button in Google Apps Dialog'
	)
);

const recordInputFocus = ( userIndex, fieldName, inputValue ) => recordGoogleEvent(
	'Domain Search',
	`Focused On "${ fieldName }" Input for User #${ userIndex } in Google Apps Dialog`,
	'Input Value',
	inputValue
);

export default connect(
	null,
	{
		recordAddUserClick,
		recordInputFocus,
	}
)( localize( GoogleAppsUsers ) );
