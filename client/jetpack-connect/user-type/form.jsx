/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class UserTypeForm extends Component {
	static propTypes = {
		submitForm: PropTypes.func.isRequired,

		// from localize() HoC
		translate: PropTypes.func.isRequired,
	};

	state = { userType: '' };

	handleRadioChange = event => this.setState( { userType: event.currentTarget.value } );

	handleSubmit = userType => {
		this.props.recordTracksEvent( 'calypso_signup_actions_submit_user_type', {
			value: userType,
		} );

		this.props.submitForm( userType );
	};

	getUserTypeQuestions = () => {
		const { translate } = this.props;

		return [
			{
				id: 1,
				slug: 'creator',
				label: translate( 'Myself' ),
			},
			{
				id: 2,
				slug: 'builder',
				label: translate( 'Someone else' ),
			},
		];
	};

	renderUserTypeProfiles() {
		return this.getUserTypeQuestions().map( userTypeProperties => (
			<Card
				className="user-type__option"
				key={ userTypeProperties.id }
				displayAsLink
				data-e2e-slug={ userTypeProperties.slug }
				tagName="button"
				onClick={ this.handleSubmit.bind( this, userTypeProperties.slug ) }
			>
				<strong className="user-type__option-label">{ userTypeProperties.label }</strong>
			</Card>
		) );
	}

	render() {
		return <Card className="user-type__wrapper">{ this.renderUserTypeProfiles() }</Card>;
	}
}

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( UserTypeForm ) );
