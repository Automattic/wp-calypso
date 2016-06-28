/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import StepWrapper from 'signup/step-wrapper';
import Gridicon from 'components/gridicon';

import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormSectionHeading from 'components/forms/form-section-heading';

import renderHeroImage from './hero-image';

export default React.createClass( {
	displayName: 'PressableStoreStep',

	propTypes: {
		stepName: React.PropTypes.string.isRequired,
		goToNextStep: React.PropTypes.func.isRequired,
		signupDependencies: React.PropTypes.object.isRequired,
	},

	getInitialState() {
		return {
			email: '',
		};
	},

	getDefaultProps() {
		return {};
	},

	onEmailChange( event ) {
		this.setState( {
			email: event.target.value,
		} );
	},

	onSubmit( event ) {
		window.location.href = `https://my.pressable.com/signup/five-sites?email=${ encodeURIComponent( this.state.email ) }&wp-ecommerce=true`;
		event.preventDefault();
	},

	renderStoreForm() {
		return (
			<div>
				<LoggedOutForm className="pressable-store__form">
					{ renderHeroImage() }

					<FormSectionHeading className="pressable-store__heading">{ this.translate( 'Create your new WordPress store for as low as $20.83/Month' ) }</FormSectionHeading>
					<p>{ this.translate( 'WordPress.com has partnered with hosting provider Pressable to make setting up your store on WordPress simple and fun.' ) }</p>

					<LoggedOutFormFooter>
						<FormLabel for="email">{ this.translate( 'Enter your email address to get started:' ) }</FormLabel>
						<div className="pressable-store__form-fields">
							<FormTextInput onChange={ this.onEmailChange } className="pressable-store__form-email is-spaced" type="email" placeholder="Email Address" name="email" />
							<FormButton onClick={ this.onSubmit } className="pressable-store__form-submit" disabled={ this.state.email === '' }>Create my Store on Pressable</FormButton>
						</div>
					</LoggedOutFormFooter>
				</LoggedOutForm>
				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem className="pressable-store__privacy-policy" target="__blank" href="https://pressable.com/legal/privacy-policy/">
						Pressable Privacy Policy <Gridicon icon="external" size={ 12 } />
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			</div>
		);
	},

	render() {
		return (
			<StepWrapper
				fallbackHeaderText={ this.translate( 'Create a WordPress Store' ) }
				fallbackSubHeaderText={ this.translate( 'Signup for Pressable to make an online store using WordPress' ) }
				subHeaderText={ this.translate( 'Baz' ) }
				stepContent={ this.renderStoreForm() }
				{ ...this.props }
				goToNextStep={ undefined } />
		);
	}
} );
