import { Gridicon, WordPressLogo } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import AutomatticLogo from 'calypso/components/automattic-logo';
import LoggedOutForm from 'calypso/components/logged-out-form';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import LoggedOutFormFooter from 'calypso/components/logged-out-form/footer';
import SignupSubmitButton from './signup-submit-button';
import SocialSignupForm from './social';
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

		const socialCardClass = clsx(
			'signup-form__crowdsignal-card',
			'signup-form__crowdsignal-social',
			{
				'is-active': ! this.state.showSignupForm,
			}
		);
		const signupCardClass = clsx( 'signup-form__crowdsignal-card', {
			'is-active': this.state.showSignupForm,
		} );
		const backButtonWrapperClass = clsx( 'signup-form__crowdsignal-back-button-wrapper', {
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
								variant="primary"
								href={ this.props.loginLink }
								className="signup-form__crowdsignal-wpcom"
								__next40pxDefaultSize
							>
								<WordPressLogo size={ 20 } />
								<span>{ translate( 'Sign in with WordPress.com' ) }</span>
							</Button>
							{ this.props.isSocialSignupEnabled && (
								<SocialSignupForm
									compact
									handleResponse={ this.props.handleSocialResponse }
									socialServiceResponse={ this.props.socialServiceResponse }
								/>
							) }
							<Button
								variant="primary"
								className="signup-form__crowdsignal-show-form"
								onClick={ this.showSignupForm }
								__next40pxDefaultSize
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
							<LoggedOutForm onSubmit={ this.props.handleSubmit } noValidate>
								{ this.props.formFields }

								<LoggedOutFormFooter>
									<SignupSubmitButton
										className="signup-form__crowdsignal-submit"
										isDisabled={ this.props.submitting || this.props.disabled }
									>
										{ translate( 'Create a WordPress.com Account' ) }
									</SignupSubmitButton>

									<p className="signup-form__crowdsignal-learn-more">
										{ translate( 'Why WordPress.com? {{a}}Learn more{{/a}}.', {
											components: {
												a: (
													<a
														href="https://crowdsignal.com/2012/12/03/crowdsignal-wordpress-account/"
														target="_blank"
														rel="noopener noreferrer"
													/>
												),
											},
										} ) }
									</p>
								</LoggedOutFormFooter>
							</LoggedOutForm>
						</div>
					</div>
				</div>

				<div className={ backButtonWrapperClass }>
					<LoggedOutFormBackLink
						classes={ { 'signup-form__crowdsignal-back-button': true } }
						oauth2Client={ this.props.oauth2Client }
						recordClick={ this.props.recordBackLinkClick }
					/>

					<Button
						className="signup-form__crowdsignal-prev-button"
						onClick={ this.hideSignupForm }
						disabled={ this.props.submitting }
					>
						<Gridicon icon="arrow-left" size={ 18 } />
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
