/**
 * Component which handle remote credentials for installing Jetpack
 */
import classnames from 'classnames';
import React, { Component, Fragment } from 'react';
import config from 'config';
import page from 'page';
import { connect } from 'react-redux';
import { flowRight, includes } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * External dependencies
 */
import { Button, Card } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormattedHeader from 'components/formatted-header';
import FormPasswordInput from 'components/forms/form-password-input';
import Gridicon from 'components/gridicon';
import HelpButton from './help-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import JetpackRemoteInstallNotices from './jetpack-remote-install-notices';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import MainWrapper from './main-wrapper';
import Spinner from 'components/spinner';
import { addCalypsoEnvQueryArg } from './utils';
import { addQueryArgs } from 'lib/route';
import {
	jetpackRemoteInstall,
	jetpackRemoteInstallUpdateError,
} from 'state/jetpack-remote-install/actions';
import getJetpackRemoteInstallErrorCode from 'state/selectors/get-jetpack-remote-install-error-code';
import getJetpackRemoteInstallErrorMessage from 'state/selectors/get-jetpack-remote-install-error-message';
import isJetpackRemoteInstallComplete from 'state/selectors/is-jetpack-remote-install-complete';
import { getConnectingSite } from 'state/jetpack-connect/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { REMOTE_PATH_AUTH } from './constants';
import {
	ACTIVATION_FAILURE,
	ACTIVATION_RESPONSE_ERROR,
	INSTALL_RESPONSE_ERROR,
	INVALID_CREDENTIALS,
	INVALID_PERMISSIONS,
	UNKNOWN_REMOTE_INSTALL_ERROR,
} from './connection-notice-types';
import WordPressLogo from 'components/wordpress-logo';

export class OrgCredentialsForm extends Component {
	state = {
		username: '',
		password: '',
		isSubmitting: false,
	};

	handleSubmit = ( event ) => {
		const { siteToConnect } = this.props;
		event.preventDefault();

		if ( this.state.isSubmitting ) {
			return;
		}
		this.setState( { isSubmitting: true } );

		this.props.recordTracksEvent( 'calypso_jpc_remoteinstall_submit', {
			url: siteToConnect,
		} );
		this.props.jetpackRemoteInstall( siteToConnect, this.state.username, this.state.password );
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { installError } = nextProps;

		if ( installError ) {
			this.setState( { isSubmitting: false } );
		}
	}

	UNSAFE_componentWillMount() {
		const { siteToConnect } = this.props;

		if ( config.isEnabled( 'jetpack/connect/remote-install' ) ) {
			if ( ! siteToConnect ) {
				page.redirect( '/jetpack/connect' );
			}
		}

		this.props.recordTracksEvent( 'calypso_jpc_remoteinstall_view', {
			url: siteToConnect,
		} );
	}

	componentDidUpdate() {
		const { isResponseCompleted } = this.props;

		if ( isResponseCompleted ) {
			// Login to remote site and redirect to JP connect URL
			this.buildRemoteSiteLoginForm().submit();
		}
	}

	buildRemoteSiteLoginForm() {
		const { siteToConnect } = this.props;

		const form = document.createElement( 'form' );
		form.setAttribute( 'method', 'post' );

		const redirectUrl = addCalypsoEnvQueryArg( siteToConnect + REMOTE_PATH_AUTH );
		const actionUrl = addQueryArgs( { redirect_to: redirectUrl }, siteToConnect + '/wp-login.php' );
		form.setAttribute( 'action', actionUrl );

		const user = document.createElement( 'input' );
		user.setAttribute( 'type', 'hidden' );
		user.setAttribute( 'name', 'log' );
		user.setAttribute( 'value', this.state.username );
		form.appendChild( user );

		const pwd = document.createElement( 'input' );
		pwd.setAttribute( 'type', 'hidden' );
		pwd.setAttribute( 'name', 'pwd' );
		pwd.setAttribute( 'value', this.state.password );
		form.appendChild( pwd );

		document.body.appendChild( form );
		return form;
	}

	getChangeHandler = ( field ) => ( event ) => {
		this.setState( { [ field ]: event.target.value } );
	};

	getHeaderText() {
		const { translate } = this.props;

		return translate( 'Add your self-hosted WordPress credentials (wp-admin)' );
	}

	getSubHeaderText() {
		const { translate } = this.props;
		const subheader = translate(
			'Your login credentials are used for the purpose of securely auto-installing Jetpack and will not be stored.'
		);
		return <span>{ subheader }</span>;
	}

	getError( installError ) {
		if ( installError === null ) {
			return undefined;
		}

		if (
			installError === 'ACTIVATION_FAILURE' ||
			installError === 'ACTIVATION_ON_INSTALL_FAILURE'
		) {
			return ACTIVATION_FAILURE;
		}
		if ( installError === 'INVALID_CREDENTIALS' ) {
			return INVALID_CREDENTIALS;
		}
		if ( installError === 'ACTIVATION_RESPONSE_ERROR' ) {
			return ACTIVATION_RESPONSE_ERROR;
		}
		if ( installError === 'INSTALL_RESPONSE_ERROR' ) {
			return INSTALL_RESPONSE_ERROR;
		}
		if ( installError === 'FORBIDDEN' ) {
			return INVALID_PERMISSIONS;
		}
		if ( installError === 'LOGIN_FAILURE' ) {
			// Non-credentials login failure. We don't know of any action that can be taken.
			return UNKNOWN_REMOTE_INSTALL_ERROR;
		}

		return UNKNOWN_REMOTE_INSTALL_ERROR;
	}

	isInvalidCreds() {
		const { installError } = this.props;
		return includes( [ INVALID_CREDENTIALS ], this.getError( installError ) );
	}

	isInvalidUsername() {
		return this.props.installErrorMessage === 'bad username';
	}

	isInvalidPassword() {
		return this.props.installErrorMessage === 'bad password';
	}

	formFields() {
		const { translate } = this.props;
		const { isSubmitting, password, username } = this.state;

		const userClassName = classnames( 'jetpack-connect__credentials-form-input', {
			'is-error': this.isInvalidUsername(),
		} );
		const passwordClassName = classnames( 'jetpack-connect__password-form-input', {
			'is-error': this.isInvalidPassword(),
		} );
		const removedProtocolURL = this.props.siteToConnect.replace( /(^\w+:|^)\/\//, '' );
		return (
			<Fragment>
				<div className="jetpack-connect__site-address">
					<div className="jetpack-connect__globe">
						<Gridicon size={ 24 } icon="globe" />
					</div>{ ' ' }
					{ removedProtocolURL }
				</div>
				<div className="jetpack-connect__wordpress-logo">
					<WordPressLogo size="72" />
				</div>
				<FormLabel htmlFor="username">{ translate( 'WordPress username or email' ) }</FormLabel>
				<div className="jetpack-connect__site-address-container">
					<Gridicon size={ 24 } icon="user" />
					<FormTextInput
						autoCapitalize="off"
						autoCorrect="off"
						className={ userClassName }
						disabled={ isSubmitting }
						id="username"
						name="username"
						onChange={ this.getChangeHandler( 'username' ) }
						value={ username || '' }
					/>
					{ this.isInvalidUsername() && (
						<FormInputValidation
							isError
							text={ translate( 'Username or email does not exist. Please try again.' ) }
						/>
					) }
				</div>
				<div className="jetpack-connect__password-container">
					<FormLabel htmlFor="password">{ translate( 'WordPress password' ) }</FormLabel>
					<div className="jetpack-connect__password-form">
						<Gridicon size={ 24 } icon="lock" />
						<FormPasswordInput
							className={ passwordClassName }
							disabled={ isSubmitting }
							id="password"
							name="password"
							onChange={ this.getChangeHandler( 'password' ) }
							value={ password || '' }
						/>
						{ this.isInvalidPassword() && (
							<FormInputValidation
								isError
								text={ translate( 'Your password is incorrect, please try again' ) }
							/>
						) }
					</div>
				</div>
				<div className="jetpack-connect__note">
					{ translate(
						'Note: WordPress credentials are not the same as WordPress.com credentials. ' +
							'Be sure to enter the username and password for your self-hosted WordPress site.'
					) }
				</div>
			</Fragment>
		);
	}

	renderButtonLabel() {
		const { isResponseCompleted, translate } = this.props;
		const { isSubmitting } = this.state;

		if ( isResponseCompleted ) {
			return translate( 'Jetpack installed' );
		}

		if ( ! isSubmitting ) {
			return translate( 'Install Jetpack' );
		}

		return translate( 'Installing…' );
	}

	formFooter() {
		const { isSubmitting } = this.state;

		return (
			<div className="jetpack-connect__creds-form-footer">
				{ isSubmitting && <Spinner className="jetpack-connect__creds-form-spinner" /> }
				<FormButton
					className="jetpack-connect__credentials-submit"
					disabled={ ! this.state.username || ! this.state.password || isSubmitting }
				>
					{ this.renderButtonLabel() }
				</FormButton>
			</div>
		);
	}

	onClickBack = () => {
		const { installError, siteToConnect } = this.props;
		if ( installError && ! this.isInvalidCreds() ) {
			this.props.jetpackRemoteInstallUpdateError( siteToConnect, null, null );
			return;
		}
		page.redirect( '/jetpack/connect' );
	};

	footerLink() {
		const { installError, siteToConnect, translate } = this.props;
		const manualInstallUrl = addQueryArgs(
			{ url: siteToConnect },
			'/jetpack/connect/instructions'
		);
		const manualInstallClick = () => {
			this.props.recordTracksEvent( 'calypso_jpc_remoteinstall_instructionsclick', {
				url: siteToConnect,
			} );
		};

		return (
			<LoggedOutFormLinks>
				{ ( this.isInvalidCreds() || ! installError ) && (
					<LoggedOutFormLinkItem href={ manualInstallUrl } onClick={ manualInstallClick }>
						{ translate( 'Install Jetpack manually' ) }
					</LoggedOutFormLinkItem>
				) }
				<HelpButton />
				<div className="jetpack-connect__navigation">
					<Button
						compact
						borderless
						className="jetpack-connect__back-button"
						onClick={ this.onClickBack }
					>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ translate( 'Back' ) }
					</Button>
				</div>
			</LoggedOutFormLinks>
		);
	}

	renderHeadersText() {
		return (
			<FormattedHeader
				headerText={ this.getHeaderText() }
				subHeaderText={ this.getSubHeaderText() }
			/>
		);
	}

	render() {
		const { installError } = this.props;

		return (
			<MainWrapper>
				{ ! this.isInvalidCreds() && installError && (
					<div className="jetpack-connect__notice">
						<JetpackRemoteInstallNotices noticeType={ this.getError( installError ) } />
					</div>
				) }
				{ ( this.isInvalidCreds() || ! installError ) && (
					<div className="jetpack-connect__site-url-entry-container">
						{ this.renderHeadersText() }
						<Card className="jetpack-connect__site-url-input-container">
							{ this.isInvalidCreds() && (
								<JetpackConnectNotices noticeType={ this.getError( installError ) } />
							) }
							<form onSubmit={ this.handleSubmit }>
								{ this.formFields() }
								{ this.formFooter() }
							</form>
						</Card>
					</div>
				) }
				{ this.footerLink() }
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const jetpackConnectSite = getConnectingSite( state );
		const siteData = jetpackConnectSite.data || {};
		const siteToConnect = siteData.urlAfterRedirects || jetpackConnectSite.url;

		return {
			installError: getJetpackRemoteInstallErrorCode( state, siteToConnect ),
			installErrorMessage: getJetpackRemoteInstallErrorMessage( state, siteToConnect ),
			isResponseCompleted: isJetpackRemoteInstallComplete( state, siteToConnect ),
			siteToConnect,
		};
	},
	{
		jetpackRemoteInstall,
		jetpackRemoteInstallUpdateError,
		recordTracksEvent,
	}
);

export default flowRight( connectComponent, localize )( OrgCredentialsForm );
