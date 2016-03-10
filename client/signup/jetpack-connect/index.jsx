/**
 * External dependencies
 */
import React from 'react';

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

/**
 * Constants
 */
const pluginURL = '/wp-admin/plugin-install.php?tab=plugin-information&plugin=jetpack';
const authURL = '/wp-admin/admin.php?page=jetpack&connect_url_redirect=true'

export default React.createClass( {
	displayName: 'JetpackConnectSiteURLStep',

	getInitialState() {
		return {
			showDialog: false,
			siteStatus: false,
			isFetching: false,
		};
	},

	onCloseDialog() {
		this.setState( { showDialog: false } );
	},

	onShowDialog() {
		this.setState( { showDialog: true } );
	},

	goToPluginInstall() {
		window.location = this.getCurrentUrl() + pluginURL;
	},

	goToRemoteAuth() {
		window.location = this.getCurrentUrl() + authURL;
	},

	showNotExistsError() {
		this.setState( { siteStatus: 'notExist', isFetching: false } );
	},

	checkIfUrlIsReadyForJetpack( url ) {
		return new Promise( function( resolve, reject ) {
			// we need to develop the backend endpoint for this check. Meanwhile, it always succeed
			resolve();
		} );
	},

	getCurrentUrl() {
		let url = this.refs.siteUrlInputRef.state.value;
		if ( url.substr( 0, 4 ) !== 'http' ) {
			url = 'http://' + url;
		}
		return url;
	},

	onURLEnter() {
		this.setState( { isFetching: true } );
		this.checkIfUrlIsReadyForJetpack( this.getCurrentUrl() )
			.then( this.goToRemoteAuth )
			.catch( this.showNotExistsError )
	},

	onDismissClick() {
		this.setState( {
			siteStatus: false
		} );
	},

	getDialogButtons() {
		return [ {
			action: 'cancel',
			label: this.translate( 'Cancel' )
		}, {
			action: 'install',
			label: this.translate( 'Connect Now' ),
			onClick: this.goToPluginInstall,
			isPrimary: true
		} ];
	},

	renderDialog() {
		if ( this.state.showDialog ) {
			return (
				<Dialog
					isVisible={ true }
					onClose={ this.onCloseDialog }
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
		return (
			<Main className="jetpack-connect">
				{ this.renderDialog() }

				<div className="jetpack-connect__site-url-entry-container">
					<ConnectHeader headerText={ this.translate( 'Connect a self-hosted WordPress' ) }
						subHeaderText={ this.translate( 'We\'ll be installing the Jetpack plugin so WordPress.com can connect to your self-hosted WordPress site.' ) }
						step={ 1 }
						steps={ 3 } />

					<Card className="jetpack-connect__site-url-input-container">
						{ this.state.siteStatus
							? <JetpackConnectNotices noticeType={ this.state.siteStatus } onDismissClick={ this.onDismissClick } />
							: null
						}

						<SiteURLInput ref="siteUrlInputRef"
							onClick={ this.onURLEnter }
							onDismissClick={ this.onDismissClick }
							isError={ this.state.isError }
							isFetching={ this.state.isFetching } />
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
