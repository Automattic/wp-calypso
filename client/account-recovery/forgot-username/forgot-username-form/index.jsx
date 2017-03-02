/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';

import {
	fetchResetOptionsByNameAndUrl,
	updatePasswordResetUserData,
} from 'state/account-recovery/reset/actions';

import {
	isRequestingAccountRecoveryResetOptions,
	getAccountRecoveryResetUserFirstName,
	getAccountRecoveryResetUserLastName,
	getAccountRecoveryResetUserSiteUrl,
	getAccountRecoveryResetOptionsError,
} from 'state/selectors';

export class ForgotUsernameFormComponent extends Component {
	submitForm = () => {
		const {
			firstName,
			lastName,
			url,
		} = this.props;

		this.props.fetchResetOptionsByNameAndUrl( {
			firstName,
			lastName,
			url,
		} );
	};

	firstNameUpdated = ( event ) => {
		this.props.updatePasswordResetUserData( { firstName: event.target.value } );
	};

	lastNameUpdated = ( event ) => {
		this.props.updatePasswordResetUserData( { lastName: event.target.value } );
	};

	siteUrlUpdated = ( event ) => {
		this.props.updatePasswordResetUserData( { url: event.target.value } );
	};

	render() {
		const {
			translate,
			firstName,
			lastName,
			url,
			isRequesting,
			requestError,
		} = this.props;

		const isPrimaryButtonEnabled = firstName && lastName && url && ! isRequesting;

		return (
			<div>
				<h2 className="forgot-username-form__title">
					{ translate( 'Forgot your username?' ) }
				</h2>
				<p>{ translate( 'Enter your information to find your username' ) }</p>
				<Card>
					<FormLabel>
						{ translate( 'First Name' ) }
						<FormInput
							className="forgot-username-form__first-name-input"
							onChange={ this.firstNameUpdated }
							value={ firstName }
							disabled={ isRequesting } />
					</FormLabel>
					<FormLabel>
						{ translate( 'Last Name' ) }
						<FormInput
							className="forgot-username-form__last-name-input"
							onChange={ this.lastNameUpdated }
							value={ lastName }
							disabled={ isRequesting } />
					</FormLabel>
					<FormLabel>
						{ translate( "Your site's URL" ) }
						<FormInput
							className="forgot-username-form__site-url-input"
							onChange={ this.siteUrlUpdated }
							value={ url }
							disabled={ isRequesting } />
					</FormLabel>
					{
						( null != requestError ) && (
						<p className="forgot-username-form__error-message">
							{ translate( 'We encountered some problems with that login information. ' +
								'Please provide another one or try again later.' ) }
						</p> )
					}
					<Button
						className="forgot-username-form__submit-button"
						onClick={ this.submitForm }
						disabled={ ! isPrimaryButtonEnabled }
						primary>
						{ translate( 'Continue' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

ForgotUsernameFormComponent.defaultProps = {
	isRequesting: false,
	firstName: '',
	lastName: '',
	url: '',
	requestError: null,
	translate: identity,
	fetchResetOptionsByNameAndUrl: noop,
	updatePasswordResetUserData: noop,
};

export default connect(
	( state ) => ( {
		isRequesting: isRequestingAccountRecoveryResetOptions( state ),
		firstName: getAccountRecoveryResetUserFirstName( state ),
		lastName: getAccountRecoveryResetUserLastName( state ),
		url: getAccountRecoveryResetUserSiteUrl( state ),
		requestError: getAccountRecoveryResetOptionsError( state ),
	} ),
	{
		fetchResetOptionsByNameAndUrl,
		updatePasswordResetUserData,
	}
)( localize( ForgotUsernameFormComponent ) );
