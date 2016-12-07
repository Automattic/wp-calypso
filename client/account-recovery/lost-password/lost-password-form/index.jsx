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
import { fetchResetOptionsByLogin } from 'state/account-recovery/reset/actions';
import { getResetOptions } from 'state/account-recovery/reset/selectors';

export class LostPasswordFormComponent extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			isSubmitting: false,
			userLogin: '',
		};
	}

	submitForm = () => {
		this.setState( { isSubmitting: true } );

		//This is only here to test the redux action and will be replaced in a future PR
		this.props.fetchResetOptionsByLogin( this.state.userLogin );
	};

	onUserLoginChanged = ( event ) => {
		this.setState( { userLogin: event.target.value } );
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.resetOptions ) {
			this.setState( { isSubmitting: false } );
		}
	}

	render() {
		const { translate } = this.props;
		const { isSubmitting, userLogin } = this.state;
		const isPrimaryButtonDisabled = ! userLogin || isSubmitting;

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
							disabled={ isSubmitting } />
					</FormLabel>
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
	translate: identity,
	fetchResetOptionsByLogin: noop,
};

export default connect(
	( state ) => ( {
		resetOptions: getResetOptions( state ),
	} ),
	{ fetchResetOptionsByLogin }
)( localize( LostPasswordFormComponent ) );
