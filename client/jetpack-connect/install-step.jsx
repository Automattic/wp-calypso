/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { preventWidows } from 'lib/formatting';
import versionCompare from 'lib/version-compare';
import JetpackExampleInstall from './example-components/jetpack-install';
import JetpackExampleActivate from './example-components/jetpack-activate';
import JetpackExampleConnect from './example-components/jetpack-connect';

const NEW_INSTRUCTIONS_JETPACK_VERSION = '4.2.0';

export default React.createClass( {
	displayName: 'JetpackInstallStep',

	confirmJetpackInstalled( event ) {
		event.preventDefault();
		this.props.confirmJetpackInstallStatus( true );
	},

	confirmJetpackNotInstalled( event ) {
		event.preventDefault();
		this.props.confirmJetpackInstallStatus( false );
	},

	renderAlreadyHaveJetpackButton() {
		return (
			<a className="jetpack-connect__already-installed-jetpack-button" href="#" onClick={ this.confirmJetpackInstalled }>
				{ preventWidows( this.translate( 'Already have Jetpack installed?' ) ) }
			</a>
		);
	},

	renderNotJetpackButton() {
		return (
			<a className="jetpack-connect__no-jetpack-button" href="#" onClick={ this.confirmJetpackNotInstalled }>
				{ preventWidows( this.translate( 'Don\'t have Jetpack installed?' ) ) }
			</a>
		);
	},

	getStep( stepName ) {
		const isLegacyVersion = (
			this.props.jetpackVersion &&
			versionCompare( this.props.jetpackVersion, NEW_INSTRUCTIONS_JETPACK_VERSION, '<' )
		);
		const jetpackConnectExample = <JetpackExampleConnect
			url={ this.props.currentUrl }
			isLegacy={ isLegacyVersion }
			onClick={ this.props.onClick } />;
		const steps = {
			installJetpack: {
				title: this.translate( '1. Install Jetpack' ),
				text: this.props.isInstall
					? this.translate( 'You will be redirected to your site\'s dashboard to install ' +
					'Jetpack. Click the blue "Install Now" button.' )
					: this.translate( 'You will be redirected to the Jetpack plugin page on your site\'s ' +
					'dashboard to install Jetpack. Click the blue install button.' ),
				action: this.renderAlreadyHaveJetpackButton(),
				example: <JetpackExampleInstall url={ this.props.currentUrl } onClick={ this.props.onClick } />
			},
			activateJetpackAfterInstall: {
				title: this.translate( '2. Activate Jetpack' ),
				text: this.translate( 'Then you\'ll click the blue "Activate" link to activate Jetpack.' ),
				action: null,
				example: <JetpackExampleActivate url={ this.props.currentUrl } isInstall={ true } onClick={ this.props.onClick } />
			},
			connectJetpackAfterInstall: {
				title: this.translate( '3. Connect Jetpack' ),
				text: this.translate( 'Finally, click the "Connect to WordPress.com" button to finish the process.' ),
				action: null,
				example: jetpackConnectExample
			},
			activateJetpack: {
				title: this.translate( '1. Activate Jetpack' ),
				text: this.translate( 'You will be redirected to your site\'s dashboard to activate Jetpack. ' +
					'Click the blue "Activate" link. ' ),
				action: this.renderNotJetpackButton(),
				example: <JetpackExampleActivate url={ this.props.currentUrl } isInstall={ false } onClick={ this.props.onClick } />
			},
			connectJetpack: {
				title: this.translate( '2. Connect Jetpack' ),
				text: this.translate( 'Then click the "Connect to WordPress.com" button to finish the process.' ),
				action: null,
				example: jetpackConnectExample
			}
		};
		return steps[ stepName ];
	},

	render() {
		const step = this.getStep( this.props.stepName );
		return (
			<Card className="jetpack-connect__install-step">
				<div className="jetpack-connect__install-step-title">
					{ step.title }
				</div>
				<div className="jetpack-connect__install-step-text">
					<span>
						{ preventWidows( step.text ) }&nbsp;
						{ step.action }
					</span>
				</div>
				{ step.example }
			</Card>
		);
	}
} );
