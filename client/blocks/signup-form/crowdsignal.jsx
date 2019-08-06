/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AutomatticLogo from 'components/automattic-logo';
import Button from 'components/button';
import FormButton from 'components/forms/form-button';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormBackLink from 'components/logged-out-form/back-link';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import WordPressLogo from 'components/wordpress-logo';
import SocialSignupForm from './social';

/**
 * Style dependencies
 */
import './crowdsignal.scss';

class CrowdsignalSignupForm extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		handleSocialResponse: PropTypes.func,
		handleSubmit: PropTypes.func,
		isSocialSignupEnabled: PropTypes.bool,
		loginLink: PropTypes.string,
		oauth2Client: PropTypes.object,
		recordBackLinkClick: PropTypes.func,
		submitting: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		disabled: false,
		submitting: false,
	};

	state = {
		showSignupForm: false,
	};

	showSignupForm = () => this.setState( { showSignupForm: true } );

	hideSignupForm = () => this.setState( { showSignupForm: false } );

	render() {
		const { translate } = this.props;

		const socialCardClass = classNames(
			'signup-form__crowdsignal-card',
			'signup-form__crowdsignal-social',
			{
				'is-active': ! this.state.showSignupForm,
			}
		);
		const signupCardClass = classNames( 'signup-form__crowdsignal-card', {
			'is-active': this.state.showSignupForm,
		} );
		const backButtonWrapperClass = classNames( 'signup-form__crowdsignal-back-button-wrapper', {
			'is-first-step': ! this.state.showSignupForm,
		} );

		return (
			<div className="signup-form__crowdsignal">
				<div className="signup-form__crowdsignal-layout">
					<div className={ socialCardClass }>
						<h2 className="signup-form__crowdsignal-card-header">
							{ translate( 'Connect an existing account:' ) }
						</h2>

						<div className="signup-form__crowdsignal-card-content">
							<p className="signup-form__crowdsignal-card-subheader">
								{ translate(
									'The fastest way.{{br/}}Use one of your existing accounts{{br/}}to sign up for Crowdsignal:',
									{
										components: {
											br: <br />,
										},
									}
								) }
							</p>

							<Button
								primary
								href={ this.props.loginLink }
								className="signup-form__crowdsignal-wpcom"
							>
								<WordPressLogo size={ 20 } />
								<span>{ translate( 'Sign in with WordPress.com' ) }</span>
							</Button>
							{ this.props.isSocialSignupEnabled && (
								<SocialSignupForm
									compact
									handleResponse={ this.props.handleSocialResponse }
									socialService={ this.props.socialService }
									socialServiceResponse={ this.props.socialServiceResponse }
								/>
							) }
							<Button
								className="signup-form__crowdsignal-show-form"
								onClick={ this.showSignupForm }
							>
								{ translate( 'Create a WordPress.com Account' ) }
							</Button>
						</div>
					</div>

					<div className="signup-form__crowdsignal-spacer">
						<span>{ translate( 'or' ) }</span>
					</div>

					<div className={ signupCardClass }>
						<h2 className="signup-form__crowdsignal-card-header">
							{ translate( 'Create a new WordPress.com account:' ) }
						</h2>

						<div className="signup-form__crowdsignal-card-content">
							<LoggedOutForm onSubmit={ this.props.handleSubmit } noValidate={ true }>
								{ this.props.formFields }

								<LoggedOutFormFooter>
									<FormButton
										className="signup-form__crowdsignal-submit"
										disabled={ this.props.submitting || this.props.disabled }
									>
										{ translate( 'Create a WordPress.com Account' ) }
									</FormButton>
								</LoggedOutFormFooter>
							</LoggedOutForm>
						</div>
					</div>
				</div>

				<div className="signup-form__crowdsignal-tos">
					<span>
						{ translate( 'By creating an account, you agree to our {{a}}Terms of Service{{/a}}.', {
							components: {
								a: <a href="https://wordpress.com/tos" target="_blank" rel="noopener noreferrer" />,
							},
						} ) }
					</span>
				</div>

				<div className={ backButtonWrapperClass }>
					<LoggedOutFormBackLink
						classes={ { 'signup-form__crowdsignal-back-button': true } }
						oauth2Client={ this.props.oauth2Client }
						recordClick={ this.props.recordBackLinkClick }
					/>

					<Button
						borderless
						compact
						className="signup-form__crowdsignal-prev-button"
						onClick={ this.hideSignupForm }
						disabled={ this.props.submitting }
					>
						<Gridicon icon="arrow-left" />
						<span>{ translate( 'Back' ) }</span>
					</Button>
				</div>

				<div className="signup-form__crowdsignal-footer">
					<p className="signup-form__crowdsignal-footer-text">
						Powered by
						<Gridicon icon="my-sites" size={ 18 } />
						WordPress.com
					</p>
					<p className="signup-form__crowdsignal-footer-text">
						An
						<AutomatticLogo size={ 18 } />
						Company
					</p>
				</div>
			</div>
		);
	}
}

export default localize( CrowdsignalSignupForm );
