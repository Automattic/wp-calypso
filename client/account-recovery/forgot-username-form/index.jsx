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
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';

import { fetchResetOptionsByNameAndUrl } from 'state/account-recovery/reset/actions';

import {
	isRequestingAccountRecoveryResetOptions,
	getAccountRecoveryResetOptionsError,
} from 'state/selectors';

export class ForgotUsernameFormComponent extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			firstName: '',
			lastName: '',
			url: '',
		};
	}

	submitForm = ( event ) => {
		const {
			firstName,
			lastName,
			url,
		} = this.state;

		this.props.fetchResetOptionsByNameAndUrl( firstName, lastName, url );

		event.preventDefault();
	};

	firstNameUpdated = ( event ) => {
		this.setState( { firstName: event.target.value } );
	};

	lastNameUpdated = ( event ) => {
		this.setState( { lastName: event.target.value } );
	};

	siteUrlUpdated = ( event ) => {
		this.setState( { url: event.target.value } );
	};

	getErrorMessage = ( requestError ) => {
		const { translate } = this.props;

		if ( ! requestError ) {
			return '';
		}

		if ( requestError.statusCode === 404 ) {
			return translate( "We're not able to find an account matching that information. " +
				'Double-check your spelling, or try another name or URL.' );
		}

		return translate( "We've encountered some technical issues. Please try again later." );
	};

	render() {
		const {
			translate,
			isRequesting,
			requestError,
		} = this.props;

		const {
			firstName,
			lastName,
			url,
		} = this.state;

		const isPrimaryButtonEnabled = firstName && lastName && url && ! isRequesting;

		return (
			<Card>
				<h2 className="forgot-username-form__title">
					{ translate( 'Forgot your username?' ) }
				</h2>
				<p>{ translate( 'Enter your full name and URL instead.' ) }</p>
				<form onSubmit={ this.submitForm }>
					<FormLabel>
						{ translate( 'First Name' ) }
						<FormInput
							className="forgot-username-form__first-name-input"
							onChange={ this.firstNameUpdated }
							value={ firstName }
							disabled={ isRequesting }
							autoFocus
						/>
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
						requestError && (
						<p className="forgot-username-form__error-message">
							{ this.getErrorMessage( requestError ) }
						</p> )
					}
					<FormButton
						className="forgot-username-form__submit-button"
						type="submit"
						disabled={ ! isPrimaryButtonEnabled }
						primary>
						{ translate( 'Continue' ) }
					</FormButton>
				</form>
			</Card>
		);
	}
}

ForgotUsernameFormComponent.defaultProps = {
	isRequesting: false,
	requestError: null,
	translate: identity,
	fetchResetOptionsByNameAndUrl: noop,
};

export default connect(
	( state ) => ( {
		isRequesting: isRequestingAccountRecoveryResetOptions( state ),
		requestError: getAccountRecoveryResetOptionsError( state ),
	} ),
	{
		fetchResetOptionsByNameAndUrl,
	}
)( localize( ForgotUsernameFormComponent ) );
