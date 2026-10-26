import { FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import { ActionButtons } from 'calypso/components/connect-screen/action-buttons';
import { ConsentText } from 'calypso/components/connect-screen/consent-text';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LoggedOutForm from 'calypso/components/logged-out-form';
import Notice from 'calypso/components/notice';
import { preventWidows } from 'calypso/lib/formatting/prevent-widows';
import { isGravPoweredOAuth2Client } from 'calypso/lib/oauth2-clients';
import wpcom from 'calypso/lib/wp';
import { LoginContext } from 'calypso/login/login-context';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { hideMagicLoginRequestNotice } from 'calypso/state/login/magic-login/actions';
import { CHECK_YOUR_EMAIL_PAGE } from 'calypso/state/login/magic-login/constants';
import {
	getRedirectToOriginal,
	getLastCheckedUsernameOrEmail,
} from 'calypso/state/login/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getMagicLoginCurrentView from 'calypso/state/selectors/get-magic-login-current-view';
import getMagicLoginRequestEmailError from 'calypso/state/selectors/get-magic-login-request-email-error';
import getMagicLoginRequestedEmailSuccessfully from 'calypso/state/selectors/get-magic-login-requested-email-successfully';
import isFetchingMagicLoginEmail from 'calypso/state/selectors/is-fetching-magic-login-email';
import EmailedLoginLinkSuccessfully from './emailed-login-link-successfully';
import EmailedLoginLinkSuccessfullyJetpackConnect from './emailed-login-link-successfully-jetpack-connect';
import { getCheckYourEmailHeaders, getEmailLinkHeaders } from './utils/heading-utils';

export class RequestLoginEmailForm extends Component {
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
		isGravPoweredClient: PropTypes.bool.isRequired,
	};

	// @ts-ignore
	static contextType = LoginContext;

	state = {
		usernameOrEmail: this.props.userEmail || '',
		site: {},
	};

	usernameOrEmailRef = createRef();

	setRequestLoginHeaders() {
		const { translate, headerText, subHeaderText } = this.props;
		const siteName = this.state.site?.name ?? null;

		const { heading, subHeading } = getEmailLinkHeaders( translate, {
			headingOverride: headerText,
			subHeadingOverride: subHeaderText,
			siteName,
		} );

		this.context?.setHeaders( {
			heading,
			subHeading,
		} );
	}

	/**
	 * Unreachable by Gravatar flow
	 */
	setCheckYourEmailHeaders() {
		const usernameOrEmail = this.getUsernameOrEmailFromState();
		const emailAddress = usernameOrEmail.indexOf( '@' ) > 0 ? usernameOrEmail : null;

		const { heading, subHeading } = getCheckYourEmailHeaders( this.props.translate, {
			emailAddress,
		} );

		this.context?.setHeaders( {
			heading,
			subHeading: preventWidows( subHeading ),
		} );
	}

	componentDidMount() {
		void this.registerWebMcp();
		const blogId = this.props.blogId;
		if ( blogId ) {
			wpcom.req
				.get( `/sites/${ this.props.blogId }` )
				.then( ( result ) => this.setState( { site: result } ) );
		}

		if ( this.props.showCheckYourEmail ) {
			/**
			 * Unreachable by Gravatar flow
			 */
			this.setCheckYourEmailHeaders();
		} else {
			/**
			 * Reachable by Gravatar flow
			 */
			this.setRequestLoginHeaders();
		}
	}

	componentWillUnmount() {
		this.webMcpController?.abort();
		this.webMcpRegistry?.dispose();
	}

	registerWebMcp = async () => {
		let redirectTo;
		try {
			redirectTo = new URL( this.props.redirectTo || '/', window.location.origin );
		} catch {
			return;
		}
		if (
			redirectTo.origin !== window.location.origin ||
			! redirectTo.pathname.startsWith( '/setup/onboarding/' ) ||
			this.props.onSubmitEmail ||
			this.props.isGravPoweredClient
		) {
			return;
		}

		const controller = new AbortController();
		this.webMcpController = controller;
		try {
			const { getWebMcpModelContext, createWebMcpToolRegistry } = await import(
				/* webpackChunkName: "webmcp" */ '@automattic/webmcp'
			);
			if ( controller.signal.aborted ) {
				return;
			}
			const modelContext = getWebMcpModelContext();
			if ( ! modelContext ) {
				return;
			}
			this.webMcpRegistry = createWebMcpToolRegistry( {
				modelContext,
				getTools: () => [
					{
						name: 'wpcom_request_email_login',
						title: 'Request email login',
						description:
							'Request a WordPress.com login link for an existing account using its email address or username. Sends an email and keeps the onboarding return destination. Check the page for success or an error, then open the received login link in this browser to finish signing in. Does not create an account.',
						inputSchema: {
							type: 'object',
							properties: {
								emailOrUsername: {
									type: 'string',
									minLength: 1,
									description: 'Email address or username of the account to log in to.',
								},
							},
							required: [ 'emailOrUsername' ],
							additionalProperties: false,
						},
						annotations: { readOnlyHint: false, consequentialHint: true },
						execute: this.requestEmailLoginFromTool,
					},
				],
			} );
			await this.webMcpRegistry.sync();
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( '[WebMCP] Email login integration failed:', error );
		}
	};

	requestEmailLoginFromTool = ( { emailOrUsername } ) => {
		if ( typeof emailOrUsername !== 'string' || ! emailOrUsername.trim() ) {
			return {
				isError: true,
				content: [ { type: 'text', text: 'Provide a non-empty email address or username.' } ],
			};
		}
		if (
			this.props.isFetching ||
			this.props.emailRequested ||
			this.props.showCheckYourEmail ||
			this.props.isEmailInputDisabled ||
			this.props.isSubmitButtonDisabled ||
			this.props.isSubmitButtonBusy ||
			this.emailLoginRequestPending
		) {
			return {
				isError: true,
				content: [
					{
						type: 'text',
						text: 'Email login is unavailable or a login email has already been requested.',
					},
				],
			};
		}

		const usernameOrEmail = emailOrUsername.trim();
		this.emailLoginRequestPending = true;
		this.setState( { usernameOrEmail } );
		this.props.hideMagicLoginRequestNotice();
		this.sendLoginEmail( usernameOrEmail, false );
		return {
			content: [
				{
					type: 'text',
					text: 'Email login requested. Check the page for confirmation or an error before reading the login email.',
				},
			],
		};
	};

	componentDidUpdate( prevProps, prevState ) {
		if ( prevProps.redirectTo !== this.props.redirectTo ) {
			this.webMcpController?.abort();
			this.webMcpRegistry?.dispose();
			void this.registerWebMcp();
		}
		if ( this.props.requestError || this.props.emailRequested || this.props.showCheckYourEmail ) {
			this.emailLoginRequestPending = false;
		}
		if ( ! prevProps.requestError && this.props.requestError ) {
			this.usernameOrEmailRef.current?.focus();
		}

		if ( this.state.site !== prevState.site ) {
			const src = this.state.site?.icon?.img ?? this.state.site?.icon?.ico ?? null;
			this.context?.setSiteIcon?.( src ? { src, alt: `${ this.state.site?.name } icon` } : null );
		}

		if ( this.state.site?.name && prevState.site?.name !== this.state.site?.name ) {
			this.setRequestLoginHeaders();
		}

		if ( ! prevProps.showCheckYourEmail && this.props.showCheckYourEmail ) {
			this.setCheckYourEmailHeaders();
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

		this.sendLoginEmail( usernameOrEmail, this.props.createAccountForNewUser );
	};

	sendLoginEmail = ( usernameOrEmail, createAccount ) => {
		this.props.onSendEmailLogin?.( usernameOrEmail );

		this.props.sendEmailLogin( usernameOrEmail, {
			redirectTo: this.props.redirectTo,
			requestLoginEmailFormFlow: true,
			createAccount,
			...( this.props.flow ? { flow: this.props.flow } : {} ),
			...( this.props.blogId ? { blogId: this.props.blogId } : {} ),
		} );
	};

	getUsernameOrEmailFromState() {
		return this.state.usernameOrEmail;
	}

	getGravatarHeader() {
		const { headerText } = this.props;
		return headerText ? (
			<h1 className="grav-powered-magic-login__form-header">{ headerText }</h1>
		) : null;
	}

	getGravatarSubHeader() {
		const { subHeaderText } = this.props;
		return subHeaderText ? (
			<p className="grav-powered-magic-login__form-sub-header">{ subHeaderText }</p>
		) : null;
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
			isGravPoweredClient,
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
			isUnifiedConnectionFlow,
		} = this.props;

		const usernameOrEmail = this.getUsernameOrEmailFromState();

		if ( showCheckYourEmail ) {
			const emailAddress = usernameOrEmail.indexOf( '@' ) > 0 ? usernameOrEmail : null;

			return isJetpackMagicLinkSignUpEnabled ? (
				<EmailedLoginLinkSuccessfullyJetpackConnect
					emailAddress={ emailAddress }
					shouldRedirect={ ! isUnifiedConnectionFlow }
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
			: this.props.translate( 'Email address or username' );

		const onSubmit = onSubmitEmail
			? ( e ) => onSubmitEmail( this.getUsernameOrEmailFromState(), e )
			: this.onSubmit;

		return (
			<div className="magic-login__form">
				{ isGravPoweredClient && this.getGravatarHeader() }
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
					{ isGravPoweredClient && this.getGravatarSubHeader() }
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
						{ tosComponent && (
							<ConsentText className="magic-login__tos wp-login__one-login-layout-tos">
								{ tosComponent }
							</ConsentText>
						) }
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
							<ActionButtons
								primaryLabel={ submitButtonLabel || buttonLabel }
								primaryType="submit"
								primaryDisabled={ ! submitEnabled }
								primaryLoading={ isSubmitButtonBusy }
							/>
						</div>
					</FormFieldset>
				</LoggedOutForm>
			</div>
		);
	}
}

const mapState = ( state ) => {
	const oauth2Client = getCurrentOAuth2Client( state );

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
		isGravPoweredClient: isGravPoweredOAuth2Client( oauth2Client ),
	};
};

const mapDispatch = {
	sendEmailLogin,
	hideMagicLoginRequestNotice,
	recordTracksEvent,
};

export default connect( mapState, mapDispatch )( localize( RequestLoginEmailForm ) );
