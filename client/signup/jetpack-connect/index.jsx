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
import { goToRemoteAuth, goToPluginInstall, checkUrl as checkUrlAction } from 'state/jetpack-connect/actions';

const JetpackConnectMain = React.createClass( {
	displayName: 'JetpackConnectSiteURLStep',

	getInitialState() {
		return {
			currentUrl: '',
		};
	},

	closeDialog() {
		this.setState( { currentUrl: '' } );
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
	},

	onURLEnter() {
		this.props.checkUrlAction( this.state.currentUrl );
	},

	onDismissClick() {
		this.setState( {
			siteStatus: false
		} );
	},

	installJetpack() {
		goToPluginInstall( this.state.currentUrl );
	},

	getDialogButtons() {
		return [ {
			action: 'cancel',
			label: this.translate( 'Cancel' )
		}, {
			action: 'install',
			label: this.translate( 'Connect Now' ),
			onClick: this.installJetpack,
			isPrimary: true
		} ];
	},

	checkProperty( propName ) {
		return this.state.currentUrl &&
			this.props.jetpackConnectSite &&
			this.props.jetpackConnectSite.data &&
			this.isCurrentUrlFetched() &&
			this.props.jetpackConnectSite.data[ propName ];
	},

	componentDidUpdate() {
		const status = this.getStatus();
		if ( status === 'notConnectedJetpack' && this.isCurrentUrlFetched() ) {
			return goToRemoteAuth( this.state.currentUrl );
		}
		if ( status === 'notJetpack' && this.isCurrentUrlFetched() ) {
			return;
		}
	},

	getStatus() {
		if ( this.state.currentUrl === '' ) {
			return false;
		}

		if ( this.state.currentUrl.toLowerCase() === 'http://wordpress.com' ) {
			return 'wordpress.com';
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
		if ( ! this.checkProperty( 'isJetpackActive' ) ) {
			return 'notActiveJetpack';
		}
		if ( ! this.checkProperty( 'isJetpackConnected' ) ) {
			return 'notConnectedJetpack';
		}

		return false;
	},

	renderDialog( status ) {
		if ( status === 'notJetpack' ) {
			return (
				<Dialog
					isVisible={ true }
					onClose={ this.closeDialog }
					additionalClassNames="jetpack-connect__wp-admin-dialog"
					buttons={ this.getDialogButtons() } >

					<h1>{ this.translate( 'Hold on there, Sparky.' ) }</h1>
					<img className="jetpack-connect__install-wp-admin"
						src="/calypso/images/jetpack/install-wp-admin.svg"
						width={ 400 }
						height={ 294 } />
					<p>{ this.translate( 'We need to send you to your WordPress install so you can approve the Jetpack installation. Click the button in the bottom-right corner on the next screen to continue.' ) }</p>
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
						{ ! this.isCurrentUrlFetching() && this.isCurrentUrlFetched() && status
							? <JetpackConnectNotices noticeType={ status } onDismissClick={ this.onDismissClick } />
							: null
						}

						<SiteURLInput ref="siteUrlInputRef"
							onChange={ this.onURLChange }
							onClick={ this.onURLEnter }
							onDismissClick={ this.onDismissClick }
							isError={ this.getStatus() }
							isFetching={ this.isCurrentUrlFetching() } />
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
	dispatch => bindActionCreators( { checkUrlAction }, dispatch )
)( JetpackConnectMain );
