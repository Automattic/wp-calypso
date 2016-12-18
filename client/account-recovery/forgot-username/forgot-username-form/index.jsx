/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';

export class ForgotUsernameFormComponent extends Component {
	constructor( ...args ) {
		super( ...args );

		this.state = {
			isSubmitting: false,
			firstName: '',
			lastName: '',
			siteUrl: '',
		};
	}

	submitForm = () => {
		this.setState( { isSubmitting: true } );

		//TODO: dispatch an event with firstName, etc and wait to here back
	};

	firstNameUpdated = event => this.setState( { firstName: event.target.value } );
	lastNameUpdated = event => this.setState( { lastName: event.target.value } );
	siteUrlUpdated = event => this.setState( { siteUrl: event.target.value } );

	render() {
		const { translate } = this.props;
		const { isSubmitting, firstName, lastName, siteUrl } = this.state;
		const isPrimaryButtonEnabled = firstName && lastName && siteUrl && ! isSubmitting;

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
							disabled={ isSubmitting } />
					</FormLabel>
					<FormLabel>
						{ translate( 'Last Name' ) }
						<FormInput
							className="forgot-username-form__last-name-input"
							onChange={ this.lastNameUpdated }
							value={ lastName }
							disabled={ isSubmitting } />
					</FormLabel>
					<FormLabel>
						{ translate( "Your site's URL" ) }
						<FormInput
							className="forgot-username-form__site-url-input"
							onChange={ this.siteUrlUpdated }
							value={ siteUrl }
							disabled={ isSubmitting } />
					</FormLabel>
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
	translate: identity,
};

export default localize( ForgotUsernameFormComponent );
