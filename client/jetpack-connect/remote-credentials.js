/** @format */
/**
 * Component which handle remote credentials for installing Jetpack
 */
import classnames from 'classnames';
import React, { Component, Fragment } from 'react';
import config from 'config';
import Gridicon from 'gridicons';
import page from 'page';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * External dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormattedHeader from 'components/formatted-header';
import FormPasswordInput from 'components/forms/form-password-input';
import HelpButton from './help-button';
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
import { getJetpackRemoteInstallErrorCode, isJetpackRemoteInstallComplete } from 'state/selectors';
import { getConnectingSite } from 'state/jetpack-connect/selectors';
import { REMOTE_PATH_AUTH } from './constants';
import {
	ACTIVATION_FAILURE,
	ACTIVATION_RESPONSE_ERROR,
	INSTALL_RESPONSE_ERROR,
	INVALID_PERMISSIONS,
	LOGIN_FAILURE,
	UNKNOWN_REMOTE_INSTALL_ERROR,
} from './connection-notice-types';

export class OrgCredentialsForm extends Component {
	state = {
		username: '',
		password: '',
		isSubmitting: false,
	};

	handleSubmit = event => {
		const { siteToConnect } = this.props;
		event.preventDefault();

		if ( this.state.isSubmitting ) {
			return;
		}
		this.setState( { isSubmitting: true } );

		this.props.jetpackRemoteInstall( siteToConnect, this.state.username, this.state.password );
	};

	componentWillReceiveProps( nextProps ) {
		const { installError } = nextProps;

		if ( installError ) {
			this.setState( { isSubmitting: false } );
		}
	}

	componentWillMount() {
		const { siteToConnect } = this.props;

		if ( config.isEnabled( 'jetpack/connect/remote-install' ) ) {
			if ( ! siteToConnect ) {
				page.redirect( '/jetpack/connect' );
			}
		}
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

		const redirectUrl = addCalypsoEnvQueryArg( REMOTE_PATH_AUTH );
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

	getChangeHandler = field => event => {
		this.setState( { [ field ]: event.target.value } );
	};

	getHeaderText() {
		const { translate } = this.props;

		return translate( 'Add your website credentials' );
	}

	getSubHeaderText() {
		const { installError, translate } = this.props;
		let subheader = translate(
			'Add your WordPress administrator credentials ' +
				'for this site. Your credentials will not be stored and are used for the purpose ' +
				'of installing Jetpack securely. You can also skip this step entirely and install Jetpack manually.'
		);

		switch ( this.getError( installError ) ) {
			case LOGIN_FAILURE:
				subheader = translate(
					'We were unable to install Jetpack because your WordPress Administrator credentials were invalid. ' +
						'Please try again with the correct credentials or try installing Jetpack manually.'
				);
				break;
		}
		return (
			<span className="jetpack-connect__install-step jetpack-connect__creds-form">
				{ subheader }
			</span>
		);
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
		if ( installError === 'LOGIN_FAILURE' ) {
			return LOGIN_FAILURE;
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
		return UNKNOWN_REMOTE_INSTALL_ERROR;
	}

	isInvalidCreds() {
		const { installError } = this.props;
		return includes( [ LOGIN_FAILURE ], this.getError( installError ) );
	}

	formFields() {
		const { translate } = this.props;
		const { isSubmitting, password, username } = this.state;

		const userClassName = classnames( 'jetpack-connect__credentials-form-input', {
			'is-error': this.isInvalidCreds(),
		} );
		const passwordClassName = classnames( 'jetpack-connect__password-form-input', {
			'is-error': this.isInvalidCreds(),
		} );

		return (
			<Fragment>
				<FormLabel htmlFor="username">{ translate( 'Username' ) }</FormLabel>
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
				</div>
				<div className="jetpack-connect__password-container">
					<FormLabel htmlFor="password">{ translate( 'Password' ) }</FormLabel>
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
					</div>
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
		const isFormInNotice = includes( [ LOGIN_FAILURE ], this.getError( installError ) );
		const manualInstallUrl = addQueryArgs(
			{ url: siteToConnect },
			'/jetpack/connect/instructions'
		);

		return (
			<LoggedOutFormLinks>
				{ ( isFormInNotice || ! installError ) && (
					<LoggedOutFormLinkItem href={ manualInstallUrl }>
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
				{ ! this.isInvalidCreds() &&
					installError && (
						<div className="jetpack-connect__notice">
							<JetpackRemoteInstallNotices noticeType={ this.getError( installError ) } />
						</div>
					) }
				{ ( this.isInvalidCreds() || ! installError ) && (
					<div>
						{ this.renderHeadersText() }
						<Card className="jetpack-connect__site-url-input-container">
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

export default connect(
	state => {
		const jetpackConnectSite = getConnectingSite( state );
		const siteData = jetpackConnectSite.data || {};
		const siteToConnect = siteData.urlAfterRedirects || jetpackConnectSite.url;
		const installError = getJetpackRemoteInstallErrorCode( state, siteToConnect );
		const isResponseCompleted = isJetpackRemoteInstallComplete( state, siteToConnect );
		return {
			installError,
			isResponseCompleted,
			siteToConnect,
		};
	},
	{
		jetpackRemoteInstall,
		jetpackRemoteInstallUpdateError,
	}
)( localize( OrgCredentialsForm ) );
