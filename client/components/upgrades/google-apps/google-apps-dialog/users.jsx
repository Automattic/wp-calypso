/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { clone } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import GoogleAppsUsersForm from './users-form';
import { recordTracksEvent, recordGoogleEvent, composeAnalytics } from 'state/analytics/actions';

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
		const fields = this.props.fields || this.getInitialFields();
		const allUserInputs = fields.map( this.inputsForUser );
		const { translate } = this.props;

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

	inputsForUser = ( user, index ) => {
		return (
			<GoogleAppsUsersForm
				domain={ this.props.domain }
				onBlur={ this.props.onBlur }
				user={ user }
				index={ index }
				updateField={ this.updateField }
				recordInputFocus={ this.recordInputFocus }
			/>
		);
	};

	recordInputFocus = ( index, fieldName ) => {
		const field = this.props.fields[ index ];
		const inputValue = field ? field.value : '';

		this.props.recordInputFocus( index, fieldName, inputValue );
	};

	addUser = ( event ) => {
		event.preventDefault();

		this.props.recordAddUserClick( this.props.analyticsSection );

		const updatedFields = this.props.fields.concat( [ this.getNewUserFields() ] );
		this.props.onChange( updatedFields );
	};

	updateField = ( index, event ) => {
		event.preventDefault();

		const fieldName = event.target.name;
		const newValue = fieldName === 'email' ? event.target.value.trim() : event.target.value;
		const updatedFields = clone( this.props.fields );

		updatedFields[ index ] = clone( updatedFields[ index ] );
		updatedFields[ index ][ fieldName ] = clone( updatedFields[ index ][ fieldName ] );
		updatedFields[ index ][ fieldName ].value = newValue;

		this.props.onChange( updatedFields );
	};
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
