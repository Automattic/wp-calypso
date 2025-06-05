import { FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
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
		requestError: PropTypes.object,
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
		onSubmitEmail: PropTypes.func,
		onSendEmailLogin: PropTypes.func,
		createAccountForNewUser: PropTypes.bool,
		blogId: PropTypes.string,
		errorMessage: PropTypes.string,
		onErrorDismiss: PropTypes.func,
		isEmailInputDisabled: PropTypes.bool,
		isEmailInputError: PropTypes.bool,
		isSubmitButtonDisabled: PropTypes.bool,
		isSubmitButtonBusy: PropTypes.bool,
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

		if ( this.props.errorMessage ) {
			this.props.onErrorDismiss?.();
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
		const { translate, subHeaderText } = this.props;
		const siteName = this.state.site?.name;

		if ( subHeaderText ) {
			return subHeaderText;
		}

		if ( siteName ) {
			return translate(
				'We’ll send you an email with a link that will log you in right away to %(siteName)s.',
				{
					args: {
						siteName,
					},
				}
			);
		}

		return translate( 'We’ll send you an email with a link that will log you in right away.' );
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
			customFormLabel,
			onSubmitEmail,
			errorMessage,
			onErrorDismiss,
			isEmailInputDisabled,
			isEmailInputError,
			isSubmitButtonDisabled,
			isSubmitButtonBusy,
			isFromJetpackOnboarding,
		} = this.props;

		const usernameOrEmail = this.getUsernameOrEmailFromState();
		const siteIcon = this.state.site?.icon?.img ?? this.state.site?.icon?.ico ?? null;

		if ( showCheckYourEmail ) {
			const emailAddress = usernameOrEmail.indexOf( '@' ) > 0 ? usernameOrEmail : null;

			return isJetpackMagicLinkSignUpEnabled ? (
				<EmailedLoginLinkSuccessfullyJetpackConnect
					emailAddress={ emailAddress }
					shouldRedirect={ ! isFromJetpackOnboarding }
					onResendEmail={ this.onSubmit }
				/>
			) : (
				<EmailedLoginLinkSuccessfully emailAddress={ emailAddress } />
			);
		}

		const submitEnabled =
			usernameOrEmail.length &&
			! isFetching &&
			! emailRequested &&
			! requestError &&
			! isSubmitButtonDisabled;

		const errorText =
			typeof requestError?.message === 'string' && requestError?.message.length
				? requestError?.message
				: translate( 'Unable to complete request' );

		const buttonLabel = translate( 'Send link' );

		const formLabel = customFormLabel
			? this.props.translate( 'Email address or username' )
			: this.props.translate( 'Email Address or Username' );

		const onSubmit = onSubmitEmail
			? ( e ) => onSubmitEmail( this.getUsernameOrEmailFromState(), e )
			: this.onSubmit;

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
				<LoggedOutForm className="magic-login__form-form" onSubmit={ onSubmit }>
					{ currentUser && currentUser.username && (
						<Notice
							showDismiss={ false }
							className="magic-login__form-header-notice"
							status="is-info"
							theme="light"
							text={ translate( 'You are already logged in as user: %(user)s', {
								args: {
									user: currentUser.username,
								},
							} ) }
						></Notice>
					) }
					{ ! hideSubHeaderText && (
						<p className="magic-login__form-sub-header">{ this.getSubHeaderText() }</p>
					) }
					<FormLabel htmlFor="usernameOrEmail">{ formLabel }</FormLabel>
					<FormFieldset className="magic-login__email-fields">
						<FormTextInput
							autoCapitalize="off"
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							disabled={ isFetching || emailRequested || isEmailInputDisabled }
							value={ usernameOrEmail }
							name="usernameOrEmail"
							ref={ this.usernameOrEmailRef }
							onChange={ this.onUsernameOrEmailFieldChange }
							placeholder={ inputPlaceholder }
							isError={ isEmailInputError }
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
						{ errorMessage && (
							<Notice
								duration={ 10000 }
								text={ errorMessage }
								className="magic-login__request-login-email-form-notice"
								showDismiss={ false }
								onDismissClick={ onErrorDismiss }
								status="is-transparent-info"
							/>
						) }
						<div className="magic-login__form-action">
							<Button
								variant="primary"
								disabled={ ! submitEnabled }
								isBusy={ isSubmitButtonBusy }
								type="submit"
								__next40pxDefaultSize
							>
								{ submitButtonLabel || buttonLabel }
							</Button>
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
