/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ConnectHeader from './connect-header';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import Main from 'components/main';
import JetpackConnectNotices from './jetpack-connect-notices';
import SiteURLInput from './site-url-input';
import { dismissUrl, goToRemoteAuth, goToPluginInstall, goToPluginActivation, checkUrl } from 'state/jetpack-connect/actions';
import JetpackExampleInstall from './exampleComponents/jetpack-install';
import JetpackExampleActivate from './exampleComponents/jetpack-activate';
import JetpackExampleConnect from './exampleComponents/jetpack-connect';
import JetpackInstallStep from './install-step';
import versionCompare from 'lib/version-compare';
import LocaleSuggestions from 'signup/locale-suggestions';

/**
 * Constants
 */
const MINIMUM_JETPACK_VERSION = '3.9.6';

const JetpackConnectMain = React.createClass( {
	displayName: 'JetpackConnectSiteURLStep',

	getInitialState() {
		return {
			currentUrl: '',
		};
	},

	dismissUrl() {
		this.props.dismissUrl( this.state.currentUrl );
	},

	isCurrentUrlFetched() {
		return this.props.jetpackConnectSite &&
			this.state.currentUrl === this.props.jetpackConnectSite.url &&
			this.props.jetpackConnectSite.isFetched;
	},

	isCurrentUrlFetching() {
		return this.state.currentUrl !== '' &&
			this.props.jetpackConnectSite &&
			this.state.currentUrl === this.props.jetpackConnectSite.url &&
			this.props.jetpackConnectSite.isFetching;
	},

	getCurrentUrl() {
		let url = this.refs.siteUrlInputRef.state.value;
		if ( url && url.substr( 0, 4 ) !== 'http' ) {
			url = 'http://' + url;
		}
		return url;
	},

	onURLChange() {
		this.setState( { currentUrl: this.getCurrentUrl() } );
		this.dismissUrl();
	},

	onURLEnter() {
		this.props.checkUrl( this.state.currentUrl );
	},

	installJetpack() {
		this.props.goToPluginInstall( this.state.currentUrl );
	},

	activateJetpack() {
		this.props.goToPluginActivation( this.state.currentUrl );
	},

	checkProperty( propName ) {
		return this.state.currentUrl &&
			this.props.jetpackConnectSite &&
			this.props.jetpackConnectSite.data &&
			this.isCurrentUrlFetched() &&
			this.props.jetpackConnectSite.data[ propName ];
	},

	componentDidUpdate() {
		if ( this.getStatus() === 'notConnectedJetpack' &&
			this.isCurrentUrlFetched() &&
			! this.props.jetpackConnectSite.isRedirecting
		) {
			return this.props.goToRemoteAuth( this.state.currentUrl );
		}
	},

	isRedirecting() {
		return this.props.jetpackConnectSite &&
			this.props.jetpackConnectSite.isRedirecting &&
			this.isCurrentUrlFetched();
	},

	getStatus() {
		if ( this.state.currentUrl === '' ) {
			return false;
		}
		if ( this.state.currentUrl.toLowerCase() === 'http://wordpress.com' || this.state.currentUrl.toLowerCase() === 'https://wordpress.com' ) {
			return 'wordpress.com';
		}
		if ( this.checkProperty( 'isWordPressDotCom' ) ) {
			return 'isDotCom';
		}
		if ( ! this.checkProperty( 'exists' ) ) {
			return 'notExists';
		}
		if ( ! this.checkProperty( 'isWordPress' ) ) {
			return 'notWordPress';
		}
		if ( ! this.checkProperty( 'hasJetpack' ) ) {
			return 'notJetpack';
		}
		const jetpackVersion = this.checkProperty( 'jetpackVersion' );
		if ( jetpackVersion && versionCompare( jetpackVersion, MINIMUM_JETPACK_VERSION, '<' ) ) {
			return 'outdatedJetpack';
		}
		if ( ! this.checkProperty( 'isJetpackActive' ) ) {
			return 'notActiveJetpack';
		}
		if ( ! this.checkProperty( 'isJetpackConnected' ) ) {
			return 'notConnectedJetpack';
		}
		if ( this.checkProperty( 'isJetpackConnected' ) ) {
			return 'alreadyConnected';
		}

		return false;
	},

	renderFooter() {
		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem href="http://jetpack.com">{ this.translate( 'Install Jetpack Manually' ) }</LoggedOutFormLinkItem>
				<LoggedOutFormLinkItem href="/start">{ this.translate( 'Start a new site on WordPress.com' ) }</LoggedOutFormLinkItem>
			</LoggedOutFormLinks>
		);
	},

	renderSiteInput( status ) {
		return (
			<Card className="jetpack-connect__site-url-input-container">
				{ ! this.isCurrentUrlFetching() && this.isCurrentUrlFetched() && ! this.props.jetpackConnectSite.isDismissed && status
					? <JetpackConnectNotices noticeType={ status } onDismissClick={ this.dismissUrl } />
					: null
				}

				<SiteURLInput ref="siteUrlInputRef"
					onChange={ this.onURLChange }
					onClick={ this.onURLEnter }
					onDismissClick={ this.onDismissClick }
					isError={ this.getStatus() }
					isFetching={ this.isCurrentUrlFetching() || this.isRedirecting() } />
			</Card>
		);
	},

	localeSuggestions() {
		if ( this.props.userModule.get() || ! this.props.locale ) {
			return;
		}

		return (
			<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
		);
	},

	renderSiteEntry() {
		const status = this.getStatus();
		return (
			<Main className="jetpack-connect">
				{ this.localeSuggestions() }
				<div className="jetpack-connect__site-url-entry-container">
					<ConnectHeader headerText={ this.translate( 'Connect a self-hosted WordPress' ) }
						subHeaderText={ this.translate( 'We\'ll be installing the Jetpack plugin so WordPress.com can connect to your self-hosted WordPress site.' ) }
						step={ 1 }
						steps={ 3 } />

					{ this.renderSiteInput( status ) }
					{ this.renderFooter() }
				</div>
			</Main>
		);
	},

	renderInstallInstructions() {
		return (
			<Main className="jetpack-connect-wide">
				{ this.localeSuggestions() }
				<div className="jetpack-connect__install">
					<ConnectHeader headerText={ this.translate( 'Ready for installation' ) }
						subHeaderText={ this.translate( 'We\'ll need to send you to your site dashboard for a few manual steps' ) }
						step={ 1 }
						steps={ 3 } />
					<div className="jetpack-connect__install-steps">
						<JetpackInstallStep title={ this.translate( '1. Install Jetpack' ) }
							text={ this.translate( 'You will be redirected to the Jetpack plugin page on your site\'s dashboard to install Jetpack. Click the blue install button.' ) }
							example={ <JetpackExampleInstall url={ this.state.currentUrl } /> } />
						<JetpackInstallStep title={ this.translate( '2. Activate Jetpack' ) }
							text={ this.translate( 'Once the plugin is installed, you\'ll need to click this tiny blue \'Activate\' link from your plugins list page.' ) }
							example={ <JetpackExampleActivate url={ this.state.currentUrl } /> } />
						<JetpackInstallStep title={ this.translate( '3. Connect Jetpack' ) }
							text={ this.translate( 'Once the plugin is activated you\'ll click this green \'Connect\' button to complete the connection.' ) }
							example={ <JetpackExampleConnect url={ this.state.currentUrl } /> } />
					</div>
					<Button onClick={ this.installJetpack } primary>{ this.translate( 'Install Jetpack' ) }</Button>
				</div>
			</Main>
		);
	},

	renderActivateInstructions() {
		return (
			<Main className="jetpack-connect-wide">
				{ this.localeSuggestions() }
				<div className="jetpack-connect__install">
					<ConnectHeader headerText={ this.translate( 'Ready for installation' ) }
						subHeaderText={ this.translate( 'We\'ll need to send you to your site dashboard for a few manual steps' ) }
						step={ 1 }
						steps={ 3 } />
					<div className="jetpack-connect__install-steps">
						<JetpackInstallStep title={ this.translate( '1. Activate Jetpack' ) }
							text={ this.translate( 'You need to click this tiny blue \'Activate\' link from your plugins list page.' ) }
							example={ <JetpackExampleActivate url={ this.state.currentUrl } /> } />
						<JetpackInstallStep title={ this.translate( '2. Connect Jetpack' ) }
							text={ this.translate( 'Once the plugin is activated you\'ll click this green \'Connect\' button to complete the connection.' ) }
							example={ <JetpackExampleConnect url={ this.state.currentUrl } /> } />
					</div>
					<Button onClick={ this.activateJetpack } primary>{ this.translate( 'Activate Jetpack' ) }</Button>
				</div>
			</Main>
		);
	},

	render() {
		if ( status === 'notJetpack' && ! this.props.jetpackConnectSite.isDismissed ) {
			return this.renderInstallInstructions();
		}
		if ( status === 'notActiveJetpack' && ! this.props.jetpackConnectSite.isDismissed ) {
			return this.renderActivateInstructions();
		}
		return this.renderSiteEntry();
	}
} );

export default connect(
	state => {
		return {
			jetpackConnectSite: state.jetpackConnect.jetpackConnectSite
		};
	},
	dispatch => bindActionCreators( { checkUrl, dismissUrl, goToRemoteAuth, goToPluginInstall, goToPluginActivation }, dispatch )
)( JetpackConnectMain );
