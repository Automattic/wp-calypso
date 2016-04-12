/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ConnectHeader from './connect-header';
import Dialog from 'components/dialog';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import Main from 'components/main';
import JetpackConnectNotices from './jetpack-connect-notices';
import SiteURLInput from './site-url-input';
import { dismissUrl, goToRemoteAuth, goToPluginInstall, goToPluginActivation, checkUrl } from 'state/jetpack-connect/actions';
import versionCompare from 'lib/version-compare';

const JetpackConnectMain = React.createClass( {
	displayName: 'JetpackConnectSiteURLStep',

	MINIMUM_JETPACK_VERSION: '4.0',

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
			this.props.jetpackConnectSite.isFetching
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

	getDialogButtons( status ) {
		const buttons = [ {
			action: 'cancel',
			label: this.translate( 'Cancel' ),
			onClick: this.dismissUrl
		} ];

		if ( status === 'notJetpack' ) {
			buttons.push( {
				action: 'install',
				label: this.translate( 'Connect Now' ),
				onClick: this.installJetpack,
				isPrimary: true
			} );
		}

		if ( status === 'notActiveJetpack' ) {
			buttons.push( {
				action: 'activate',
				label: this.translate( 'Activate' ),
				onClick: this.activateJetpack,
				isPrimary: true
			} );
		}

		return buttons;
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
		if ( jetpackVersion && versionCompare( jetpackVersion, this.MINIMUM_JETPACK_VERSION, '<' ) ) {
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

	renderDialog( status ) {
		if ( status === 'notJetpack' && ! this.props.jetpackConnectSite.isDismissed ) {
			return (
				<Dialog
					isVisible={ true }
					onClose={ this.dismissUrl }
					additionalClassNames="jetpack-connect__wp-admin-dialog"
					buttons={ this.getDialogButtons( status ) } >

					<h1>{ this.translate( 'Hold on there, Sparky.' ) }</h1>
					<img className="jetpack-connect__install-wp-admin"
						src="/calypso/images/jetpack/install-wp-admin.svg"
						width={ 400 }
						height={ 294 } />
					<p>{ this.translate( 'We need to send you to your WordPress install so you can approve the Jetpack installation. Click the button in the bottom-right corner on the next screen to continue.' ) }</p>
				</Dialog>
			);
		};
		if ( status === 'notActiveJetpack' && ! this.props.jetpackConnectSite.isDismissed ) {
			return (
				<Dialog
					isVisible={ true }
					onClose={ this.dismissUrl }
					additionalClassNames="jetpack-connect__wp-admin-dialog"
					buttons={ this.getDialogButtons( status ) } >

					<h1>{ this.translate( 'Hold on there, Sparky.' ) }</h1>
					<img className="jetpack-connect__activate-wp-admin"
						src="/calypso/images/jetpack/activate-wp-admin.png"
						width={ 400 }
						height={ 294 } />
					<p>{ this.translate( 'Your jetpack seems to be inactive! We need to send you to your WordPress install so you can activate it before completing the connection.' ) }</p>
				</Dialog>
			);
		};
	},

	render() {
		const status = this.getStatus();
		return (
			<Main className="jetpack-connect">
				{ this.renderDialog( status ) }

				<div className="jetpack-connect__site-url-entry-container">
					<ConnectHeader headerText={ this.translate( 'Connect a self-hosted WordPress' ) }
						subHeaderText={ this.translate( 'We\'ll be installing the Jetpack plugin so WordPress.com can connect to your self-hosted WordPress site.' ) }
						step={ 1 }
						steps={ 3 } />

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

					<LoggedOutFormLinks>
						<LoggedOutFormLinkItem href="http://jetpack.com">{ this.translate( 'Install Jetpack Manually' ) }</LoggedOutFormLinkItem>
						<LoggedOutFormLinkItem href="/start">{ this.translate( 'Start a new site on WordPress.com' ) }</LoggedOutFormLinkItem>
					</LoggedOutFormLinks>
				</div>
			</Main>
		);
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
