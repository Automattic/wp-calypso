import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component, cloneElement } from 'react';
import {
	GoogleSocialButton,
	AppleLoginButton,
	GithubSocialButton,
	PayPalSocialButton,
	MagicLoginButton,
	QrCodeLoginButton,
	UsernameOrEmailButton,
	LastUsedBadge,
	LoginMethodImpression,
} from 'calypso/components/social-buttons';

import './social.scss';

// Services whose buttons fire `calypso_login_social_button_click` (kept as
// the funnel #61428 before/after bridge) AND `calypso_login_method_click`
// via `trackLoginAndRememberRedirect`. magic-login / qr-code don't — they
// have their own internal Tracks events and take a plain `onClick` hook,
// so we fire `calypso_login_method_click` for them directly below.
const SOCIAL_CLICK_SERVICES = [ 'google', 'apple', 'github', 'paypal' ];

class SocialLoginForm extends Component {
	static propTypes = {
		handleLogin: PropTypes.func.isRequired,
		trackLoginAndRememberRedirect: PropTypes.func.isRequired,
		socialServiceResponse: PropTypes.object,
		magicLoginLink: PropTypes.string,
		qrLoginLink: PropTypes.string,
		isSocialFirst: PropTypes.bool,
		lastUsedAuthenticationMethod: PropTypes.string,
		resetLastUsedAuthenticationMethod: PropTypes.func,
		isJetpack: PropTypes.bool,
		allowedSocialServices: PropTypes.arrayOf( PropTypes.string ),
		oauth2Client: PropTypes.object,
		isWoo: PropTypes.bool,
		currentRoute: PropTypes.string,
		from: PropTypes.string,
	};

	socialLoginButtons = [
		{
			service: 'google',
			enabled: true,
			button: (
				<GoogleSocialButton
					responseHandler={ this.props.handleLogin }
					onClick={ this.props.trackLoginAndRememberRedirect }
					key="social-login-button-google"
					isLogin
				/>
			),
		},
		{
			service: 'apple',
			enabled: true,
			button: (
				<AppleLoginButton
					responseHandler={ this.props.handleLogin }
					onClick={ this.props.trackLoginAndRememberRedirect }
					socialServiceResponse={ this.props.socialServiceResponse }
					key="social-login-button-apple"
					isLogin
				/>
			),
		},
		{
			service: 'github',
			enabled: true,
			button: (
				<GithubSocialButton
					responseHandler={ this.props.handleLogin }
					onClick={ this.props.trackLoginAndRememberRedirect }
					socialServiceResponse={ this.props.socialServiceResponse }
					key="social-login-button-github"
					isLogin
				/>
			),
		},
		{
			service: 'paypal',
			enabled: config.isEnabled( 'sign-in-with-paypal' ),
			button: (
				<PayPalSocialButton
					responseHandler={ this.props.handleLogin }
					onClick={ this.props.trackLoginAndRememberRedirect }
					socialServiceResponse={ this.props.socialServiceResponse }
					key="social-login-button-paypal"
					isLogin
				/>
			),
		},
		{
			service: 'magic-login',
			enabled: true,
			button: this.props.isSocialFirst && this.props.magicLoginLink && (
				<MagicLoginButton
					loginUrl={ this.props.magicLoginLink }
					key="social-login-button-magic-login"
					isJetpack={ this.props.isJetpack }
				/>
			),
		},
		{
			service: 'qr-code',
			// QrCodeLoginButton itself returns null when there is an oauth2Client
			// outside the Woo flow. Disabling the entry here keeps that case out of
			// the rendered list — otherwise the `<LastUsedBadge>` wrapper would
			// still mount around a null child and produce an orphan badge.
			enabled: ! ( this.props.oauth2Client && ! this.props.isWoo ),
			button: this.props.isSocialFirst && this.props.qrLoginLink && (
				<QrCodeLoginButton loginUrl={ this.props.qrLoginLink } key="social-login-button-qr-code" />
			),
		},
	];

	/**
	 * Returns the final array of social login buttons to render.
	 * Handles filtering by allowedSocialServices, enabled state, and
	 * replacing/appending UsernameOrEmailButton for lastUsedAuthenticationMethod.
	 */
	getSocialButtons() {
		const { allowedSocialServices, isSocialFirst, lastUsedAuthenticationMethod } = this.props;

		// Filter by allowedSocialServices if provided, otherwise use all buttons
		const buttons = allowedSocialServices
			? allowedSocialServices
					.map( ( service ) => this.socialLoginButtons.find( ( btn ) => btn.service === service ) )
					.filter( Boolean )
			: this.socialLoginButtons;

		// Filter out disabled buttons and transform to rendered elements.
		// `button` may be falsy even when `enabled: true` — magic-login and
		// qr-code resolve to `false` when their links are missing — so we
		// guard with `Boolean(button)`. The other "renders to null at runtime"
		// case (qr-code under non-Woo oauth2) is handled upstream via the
		// `enabled` field, so the wrappers never mount around a vanishing child.
		const renderedButtons = buttons
			.filter( ( { enabled, button } ) => enabled && Boolean( button ) )
			.map( ( { service, button } ) => {
				const isBadged = isSocialFirst && service === lastUsedAuthenticationMethod;

				// Compose the click handler for this method.
				//
				// Social services (google/apple/github/paypal) route through
				// `trackLoginAndRememberRedirect`, which fires two events:
				//   - `calypso_login_social_button_click` (kept as the funnel
				//     #61428 bridge — the only signal the pre-badge UI also
				//     recorded, so it's the before/after comparison anchor)
				//   - `calypso_login_method_click` (new standardized event)
				// Non-badged social buttons keep their default onClick; only
				// the badged case needs to inject `isLastUsedAuthenticationMethod=true`.
				//
				// magic-login / qr-code don't go through that path, so we fire
				// `calypso_login_method_click` for them directly via the
				// optional `onClick` hook those buttons accept.
				let interactiveButton = button;
				if ( SOCIAL_CLICK_SERVICES.includes( service ) ) {
					if ( isBadged ) {
						interactiveButton = cloneElement( button, {
							onClick: ( event ) => this.props.trackLoginAndRememberRedirect( event, true ),
						} );
					}
				} else {
					interactiveButton = cloneElement( button, {
						onClick: () => {
							recordTracksEvent( 'calypso_login_method_click', {
								path: this.props.currentRoute,
								from: this.props.from,
								method: service,
								badge_view: isBadged,
							} );
						},
					} );
				}

				// Wrap the badged method in the visual "Last used" pill.
				const visual = isBadged ? (
					<LastUsedBadge>{ interactiveButton }</LastUsedBadge>
				) : (
					interactiveButton
				);

				// Always wrap in LoginMethodImpression so we record an
				// impression event for every method shown, with `badge_view`
				// distinguishing badged vs unbadged exposure.
				return (
					<LoginMethodImpression
						key={ button.key }
						method={ service }
						badgeView={ isBadged }
						path={ this.props.currentRoute }
						from={ this.props.from }
					>
						{ visual }
					</LoginMethodImpression>
				);
			} );

		// Append fallback UsernameOrEmailButton if lastUsedAuthenticationMethod
		// is not in the allowed list. This handles the case where a user logged in
		// via a social option on another page (e.g., Google) and then visits a
		// partner login page (e.g., PayPal) that excludes that social option.
		const needsFallbackButton =
			isSocialFirst &&
			lastUsedAuthenticationMethod &&
			allowedSocialServices &&
			! allowedSocialServices.includes( lastUsedAuthenticationMethod );

		if ( needsFallbackButton ) {
			renderedButtons.push(
				<UsernameOrEmailButton
					key="social-login-button-username-or-email-fallback"
					onClick={ this.props.resetLastUsedAuthenticationMethod }
				/>
			);
		}

		return renderedButtons;
	}

	render() {
		const { isSocialFirst } = this.props;

		return (
			<Card
				className={ clsx( 'auth-form__social', 'is-login', { 'is-social-first': isSocialFirst } ) }
			>
				<div className="auth-form__social-buttons">
					<div className="auth-form__social-buttons-container">{ this.getSocialButtons() }</div>
				</div>
			</Card>
		);
	}
}

export default SocialLoginForm;
