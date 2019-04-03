/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { clone, kebabCase } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import getUserSetting from 'state/selectors/get-user-setting';
import GoogleAppsUsersForm from './users-form';
import QueryUserSettings from 'components/data/query-user-settings';
import { recordTracksEvent, recordGoogleEvent, composeAnalytics } from 'state/analytics/actions';

class GoogleAppsUsers extends React.Component {
	componentDidMount() {
		const { firstName, lastName } = this.props;

		this.props.onChange(
			this.props.fields ? this.props.fields : [ this.getNewUserFields( firstName, lastName ) ]
		);
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { fields, firstName, lastName } = nextProps;
		if ( this.props.firstName !== firstName && fields.length === 1 ) {
			this.props.onChange( [
				{
					...fields[ 0 ],
					firstName: { value: firstName || '' },
					lastName: { value: lastName || '' },
					username: { value: kebabCase( firstName ) },
				},
			] );
		}
	}

	getNewUserFields( firstName = '', lastName = '' ) {
		return {
			email: { value: kebabCase( firstName ), error: null },
			firstName: { value: firstName || '', error: null },
			lastName: { value: lastName || '', error: null },
			domain: { value: this.props.domain, error: null },
		};
	}

	render() {
		const { fields, translate } = this.props;
		const allUserInputs = fields && fields.map( this.inputsForUser );

		return (
			<div className="gsuite-dialog__users" key="gsuite-dialog__users">
				<QueryUserSettings />
				<h4>{ translate( 'New G Suite User:' ) }</h4>

				{ allUserInputs }

				<button className="gsuite-dialog__add-another-user-button" onClick={ this.addUser }>
					<Gridicon icon="plus" />
					{ translate( 'Add Another User' ) }
				</button>
			</div>
		);
	}

	inputsForUser = ( user, index ) => {
		return (
			<GoogleAppsUsersForm
				domain={ this.props.domain }
				index={ index }
				key={ `gsuite-user-form-${ index }` }
				onBlur={ this.props.onBlur }
				recordInputFocus={ this.recordInputFocus }
				user={ user }
				updateField={ this.updateField }
			/>
		);
	};

	recordInputFocus = ( index, fieldName ) => {
		const field = this.props.fields[ index ];
		const inputValue = field ? field.value : '';

		this.props.recordInputFocus( index, fieldName, inputValue );
	};

	addUser = event => {
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

const recordAddUserClick = section =>
	composeAnalytics(
		recordTracksEvent( 'calypso_google_apps_add_user_button_click', { section } ),
		recordGoogleEvent( 'Domain Search', 'Clicked "Add User" Button in Google Apps Dialog' )
	);

const recordInputFocus = ( userIndex, fieldName, inputValue ) =>
	recordGoogleEvent(
		'Domain Search',
		`Focused On "${ fieldName }" Input for User #${ userIndex } in Google Apps Dialog`,
		'Input Value',
		inputValue
	);

export default connect(
	state => ( {
		firstName: getUserSetting( state, 'first_name' ),
		lastName: getUserSetting( state, 'last_name' ),
	} ),
	{
		recordAddUserClick,
		recordInputFocus,
	}
)( localize( GoogleAppsUsers ) );
