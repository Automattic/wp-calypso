/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class UserTypeForm extends Component {
	static propTypes = {
		userType: PropTypes.string,
		submitForm: PropTypes.func.isRequired,

		// from localize() HoC
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			userType: props.userType,
		};
	}

	handleRadioChange = event => this.setState( { userType: event.currentTarget.value } );

	handleSubmit = event => {
		const { userType } = this.state;

		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_signup_actions_submit_user_type', {
			value: userType,
		} );

		this.props.submitForm( userType );
	};

	renderRadioOptions() {
		const { translate } = this.props;

		const userTypeQuestions = [
			{
				slug: 'creator',
				label: translate( 'Myself' ),
			},
			{
				slug: 'builder',
				label: translate( 'Someone else' ),
			},
		];
		return userTypeQuestions.map( userTypeProperties => (
			<FormLabel
				className={ classNames( 'user-type__option', {
					'is-selected': userTypeProperties.slug === this.state.userType,
				} ) }
				key={ userTypeProperties.id }
			>
				<FormRadio
					value={ userTypeProperties.slug }
					checked={ userTypeProperties.slug === this.state.userType }
					onChange={ this.handleRadioChange }
				/>
				<strong className="user-type__option-label">{ userTypeProperties.label }</strong>
				<span className="user-type__option-description">{ userTypeProperties.description }</span>
			</FormLabel>
		) );
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="user-type__wrapper">
				<form onSubmit={ this.handleSubmit }>
					<Card>
						<FormFieldset>{ this.renderRadioOptions() }</FormFieldset>
						<Button primary={ true } type="submit" disabled={ ! this.state.userType }>
							{ translate( 'Continue' ) }
						</Button>
					</Card>
				</form>
			</div>
		);
	}
}

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( UserTypeForm ) );
