import { FormLabel } from '@automattic/components';
import { englishLocales } from '@automattic/i18n-utils';
import { hasTranslation } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LoggedOutForm from 'calypso/components/logged-out-form';
import Notice from 'calypso/components/notice';
import wpcom from 'calypso/lib/wp';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { hideMagicLoginRequestNotice } from 'calypso/state/login/magic-login/actions';
import { CHECK_YOUR_EMAIL_PAGE } from 'calypso/state/login/magic-login/constants';
import {
	getRedirectToOriginal,
	getLastCheckedUsernameOrEmail,
} from 'calypso/state/login/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import getMagicLoginRequestEmailError from 'calypso/state/selectors/get-magic-login-request-email-error';
import getMagicLoginRequestedEmailSuccessfully from 'calypso/state/selectors/get-magic-login-requested-email-successfully';
import isFetchingMagicLoginEmail from 'calypso/state/selectors/is-fetching-magic-login-email';
import EmailedLoginLinkSuccessfully from './emailed-login-link-successfully';
import EmailedLoginLinkSuccessfullyJetpackConnect from './emailed-login-link-successfully-jetpack-connect';

class RequestLoginEmailForm extends Component {
	static propTypes = {
		// mapped to state
		currentUser: PropTypes.object,
		emailRequested: PropTypes.bool,
		isFetching: PropTypes.bool,
		isJetpackMagicLinkSignUpEnabled: PropTypes.bool,
		redirectTo: PropTypes.string,
		requestError: PropTypes.string,
		showCheckYourEmail: PropTypes.bool,
		userEmail: PropTypes.string,
		flow: PropTypes.string,
		locale: PropTypes.string,

		// mapped to dispatch
		sendEmailLogin: PropTypes.func.isRequired,
		hideMagicLoginRequestNotice: PropTypes.func.isRequired,

		tosComponent: PropTypes.node,
		headerText: PropTypes.string,
		subHeaderText: PropTypes.string,
		hideSubHeaderText: PropTypes.bool,
		customFormLabel: PropTypes.string,
		inputPlaceholder: PropTypes.string,
		submitButtonLabel: PropTypes.string,
		onSendEmailLogin: PropTypes.func,
		createAccountForNewUser: PropTypes.bool,
		blogId: PropTypes.string,
	};

	state = {
		usernameOrEmail: this.props.userEmail || '',
		site: {},
	};

	usernameOrEmailRef = createRef();

	componentDidMount() {
		const blogId = this.props.blogId;
		if ( blogId ) {
			wpcom.req
				.get( `/sites/${ this.props.blogId }` )
				.then( ( result ) => this.setState( { site: result } ) );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.requestError && this.props.requestError ) {
			this.usernameOrEmailRef.current?.focus();
		}
	}

	onUsernameOrEmailFieldChange = ( event ) => {
		this.setState( {
			usernameOrEmail: event.target.value,
		} );

		if ( this.props.requestError ) {
			this.props.hideMagicLoginRequestNotice();
		}
	};

	onNoticeDismiss = () => {
		this.props.hideMagicLoginRequestNotice();
	};

	onSubmit = ( event ) => {
		event.preventDefault();

		const usernameOrEmail = this.getUsernameOrEmailFromState();

		if ( ! usernameOrEmail.length ) {
			return;
		}

		this.props.onSendEmailLogin?.( usernameOrEmail );

		this.props.sendEmailLogin( usernameOrEmail, {
			redirectTo: this.props.redirectTo,
			requestLoginEmailFormFlow: true,
			createAccount: this.props.createAccountForNewUser,
			...( this.props.flow ? { flow: this.props.flow } : {} ),
			...( this.props.blogId ? { blogId: this.props.blogId } : {} ),
		} );
	};

	getUsernameOrEmailFromState() {
		return this.state.usernameOrEmail;
	}

	getSubHeaderText() {
		const { translate, locale, subHeaderText } = this.props;
		const siteName = this.state.site?.name;

		if ( subHeaderText ) {
			return subHeaderText;
		}

		// If we have a siteName and new translation is available
		if (
			siteName &&
			( englishLocales.includes( locale ) ||
				hasTranslation(
					'We’ll send you an email with a login link that will log you in right away to {site name}.'
				) )
		) {
			return translate(
				'We’ll send you an email with a login link that will log you in right away to %(siteName)s.',
				{
					args: {
						siteName,
					},
				}
			);
		}

		// If no siteName but new translation is available
		if (
			englishLocales.includes( locale ) ||
			hasTranslation( 'We’ll send you an email with a login link that will log you in right away.' )
		) {
			return translate(
				'We’ll send you an email with a login link that will log you in right away.'
			);
		}

		// Fallback is old text
		return translate(
			'Get a link sent to the email address associated with your account to log in instantly without your password.'
		);
	}

	render() {
		const {
			currentUser,
			requestError,
			isFetching,
			isJetpackMagicLinkSignUpEnabled,
			emailRequested,
			showCheckYourEmail,
			translate,
			tosComponent,
			headerText,
			hideSubHeaderText,
			inputPlaceholder,
			submitButtonLabel,
			locale,
			customFormLabel,
		} = this.props;

		const usernameOrEmail = this.getUsernameOrEmailFromState();
		const siteIcon = this.state.site?.icon?.img ?? this.state.site?.icon?.ico ?? null;

		if ( showCheckYourEmail ) {
			const emailAddress = usernameOrEmail.indexOf( '@' ) > 0 ? usernameOrEmail : null;

			return isJetpackMagicLinkSignUpEnabled ? (
				<EmailedLoginLinkSuccessfullyJetpackConnect emailAddress={ emailAddress } />
			) : (
				<EmailedLoginLinkSuccessfully emailAddress={ emailAddress } />
			);
		}

		const submitEnabled =
			usernameOrEmail.length && ! isFetching && ! emailRequested && ! requestError;

		const errorText =
			typeof requestError === 'string' && requestError.length
				? requestError
				: translate( 'Unable to complete request' );

		const buttonLabel =
			englishLocales.includes( locale ) || hasTranslation( 'Send Link' )
				? translate( 'Send link' )
				: translate( 'Get Link' );

		const formLabel =
			customFormLabel ||
			( hasTranslation( 'Email address or username' )
				? this.props.translate( 'Email address or username' )
				: this.props.translate( 'Email Address or Username' ) );

		return (
			<div className="magic-login__form">
				{ siteIcon && (
					<div className="magic-login__form-header-icon">
						<img
							src={ siteIcon }
							width={ 64 }
							height={ 64 }
							alt={ `${ this.state.site?.name } icon` }
						/>
					</div>
				) }
				<h1 className="magic-login__form-header">
					{ headerText || translate( 'Email me a login link' ) }
				</h1>
				{ currentUser && currentUser.username && (
					<p>
						{ translate( 'NOTE: You are already logged in as user: %(user)s', {
							args: {
								user: currentUser.username,
							},
						} ) }
					</p>
				) }
				<LoggedOutForm onSubmit={ this.onSubmit }>
					<p className="magic-login__form-sub-header">
						{ ! hideSubHeaderText && this.getSubHeaderText() }
					</p>
					<FormLabel htmlFor="usernameOrEmail">{ formLabel }</FormLabel>
					<FormFieldset className="magic-login__email-fields">
						<FormTextInput
							autoCapitalize="off"
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							disabled={ isFetching || emailRequested }
							value={ usernameOrEmail }
							name="usernameOrEmail"
							ref={ this.usernameOrEmailRef }
							onChange={ this.onUsernameOrEmailFieldChange }
							placeholder={ inputPlaceholder }
						/>
						{ tosComponent }
						{ requestError && (
							<Notice
								duration={ 10000 }
								text={ errorText }
								className="magic-login__request-login-email-form-notice"
								showDismiss={ false }
								onDismissClick={ this.onNoticeDismiss }
								status="is-transparent-info"
							/>
						) }
						<div className="magic-login__form-action">
							<FormButton primary disabled={ ! submitEnabled }>
								{ submitButtonLabel || buttonLabel }
							</FormButton>
						</div>
					</FormFieldset>
				</LoggedOutForm>
			</div>
		);
	}
}

const mapState = ( state ) => {
	return {
		locale: getCurrentLocaleSlug( state ),
		currentUser: getCurrentUser( state ),
		isFetching: isFetchingMagicLoginEmail( state ),
		redirectTo: getRedirectToOriginal( state ),
		requestError: getMagicLoginRequestEmailError( state ),
		showCheckYourEmail: getMagicLoginCurrentView( state ) === CHECK_YOUR_EMAIL_PAGE,
		emailRequested: getMagicLoginRequestedEmailSuccessfully( state ),
		blogId: getCurrentQueryArguments( state ).blog_id,
		userEmail:
			getLastCheckedUsernameOrEmail( state ) ||
			getCurrentQueryArguments( state ).email_address ||
			getInitialQueryArguments( state ).email_address,
	};
};

const mapDispatch = {
	sendEmailLogin,
	hideMagicLoginRequestNotice,
	recordTracksEvent,
};

export default connect( mapState, mapDispatch )( localize( RequestLoginEmailForm ) );
