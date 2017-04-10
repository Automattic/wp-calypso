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
import support from 'lib/url/support';
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';

import {
	fetchResetOptionsByLogin,
	updatePasswordResetUserData,
} from 'state/account-recovery/reset/actions';

import {
	isRequestingAccountRecoveryResetOptions,
	getAccountRecoveryResetUserData,
	getAccountRecoveryResetOptionsError,
} from 'state/selectors';

import { ACCOUNT_RECOVERY_ROUTES } from 'account-recovery/constants';

export class LostPasswordFormComponent extends Component {
	submitForm = ( event ) => {
		this.props.fetchResetOptionsByLogin( this.props.userLogin );

		event.preventDefault();
	};

	onUserLoginChanged = ( event ) => {
		this.props.updatePasswordResetUserData( {
			user: event.target.value
		} );
	};

	render() {
		const {
			translate,
			userLogin,
			isRequesting,
			requestError,
		} = this.props;

		const isPrimaryButtonDisabled = ! userLogin || isRequesting;

		return (
			<div>
				<Card compact>
					<h2 className="lost-password-form__title">
						{ translate( 'Lost your password?' ) }
					</h2>
					<p>{ translate( 'Follow these simple steps to reset your account:' ) }</p>
					<ol className="lost-password-form__instruction-list">
						<li>
							{ translate(
								'Enter your {{strong}}WordPress.com{{/strong}} username or email address',
								{ components: { strong: <strong /> } }
							) }
						</li>
						<li>
							{ translate( 'Choose a password reset method' ) }
						</li>
						<li>
							{ translate(
								'Follow instructions and be reunited with your {{strong}}WordPress.com{{/strong}} account',
								{ components: { strong: <strong /> } }
							) }
						</li>
					</ol>
					<p>
						{ translate(
							'Want more help? We have a full {{link}}guide to resetting your password{{/link}}.',
							{ components: { link: <a href={ support.ACCOUNT_RECOVERY } /> } }
						) }
					</p>
				</Card>
				<Card compact>
					<form onSubmit={ this.submitForm }>
						<FormLabel>
							{ translate( 'Username or Email' ) }
						</FormLabel>
						<FormInput
							className="lost-password-form__user-login-input"
							onChange={ this.onUserLoginChanged }
							value={ userLogin || '' }
							disabled={ isRequesting }
							autoFocus
						/>
						{
							requestError && (
							<p className="lost-password-form__error-message">
								{ translate( 'We encountered some problems with that login information. ' +
									'Please provide another one or try again later.' ) }
							</p> )
						}
						<FormButton
							className="lost-password-form__submit-button"
							type="submit"
							disabled={ isPrimaryButtonDisabled }
							primary
						>
							{ translate( 'Get New Password' ) }
						</FormButton>
					</form>
					<a href={ ACCOUNT_RECOVERY_ROUTES.FORGOT_USERNAME } className="lost-password-form__forgot-username-link">
						{ translate( 'Forgot your username?' ) }
					</a>
				</Card>
			</div>
		);
	}
}

LostPasswordFormComponent.defaultProps = {
	isRequesting: false,
	userLogin: null,
	requestError: null,
	translate: identity,
	redirectToNextPage: identity,
	fetchResetOptionsByLogin: noop,
	updatePasswordResetUserData: noop,
};

export default connect(
	( state ) => ( {
		isRequesting: isRequestingAccountRecoveryResetOptions( state ),
		userLogin: getAccountRecoveryResetUserData( state ).user,
		requestError: getAccountRecoveryResetOptionsError( state ),
	} ),
	{
		fetchResetOptionsByLogin,
		updatePasswordResetUserData,
	}
)( localize( LostPasswordFormComponent ) );
