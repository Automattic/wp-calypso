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
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';

import {
	fetchResetOptionsByLogin,
	updatePasswordResetUserData,
} from 'state/account-recovery/reset/actions';

import {
	isRequestingAccountRecoveryResetOptions,
	getAccountRecoveryResetUserLogin,
	getAccountRecoveryResetOptionsError,
} from 'state/selectors';

export class LostPasswordFormComponent extends Component {
	submitForm = () => {
		this.props.fetchResetOptionsByLogin( this.props.userLogin );
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
				<h2 className="lost-password-form__title">
					{ translate( 'Lost your password' ) }
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
							'Follow instructions and be re-united with your {{strong}}WordPress.com{{/strong}} account',
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
				<Card>
					<FormLabel>
						{ translate( 'Username or Email' ) }

						<FormInput
							className="lost-password-form__user-login-input"
							onChange={ this.onUserLoginChanged }
							value={ userLogin }
							disabled={ isRequesting } />
					</FormLabel>
					{
						( null != requestError ) && (
						<p className="lost-password-form__error-message">
							{ translate( 'We encountered some problems with that login information. ' +
								'Please provide another one or try again later.' ) }
						</p> )
					}
					<a href="/account-recovery/forgot-username" className="lost-password-form__forgot-username-link">
						{ translate( 'Forgot your username?' ) }
					</a>
					<Button
						className="lost-password-form__submit-button"
						onClick={ this.submitForm }
						disabled={ isPrimaryButtonDisabled }
						primary
					>
						{ translate( 'Get New Password' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

LostPasswordFormComponent.defaultProps = {
	isRequesting: false,
	userLogin: '',
	requestError: null,
	translate: identity,
	fetchResetOptionsByLogin: noop,
	updatePasswordResetUserData: noop,
};

export default connect(
	( state ) => ( {
		isRequesting: isRequestingAccountRecoveryResetOptions( state ),
		userLogin: getAccountRecoveryResetUserLogin( state ),
		requestError: getAccountRecoveryResetOptionsError( state ),
	} ),
	{
		fetchResetOptionsByLogin,
		updatePasswordResetUserData,
	}
)( localize( LostPasswordFormComponent ) );
