/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { preventWidows } from 'lib/formatting';
import versionCompare from 'lib/version-compare';
import JetpackExampleInstall from './example-components/jetpack-install';
import JetpackExampleActivate from './example-components/jetpack-activate';
import JetpackExampleConnect from './example-components/jetpack-connect';

const NEW_INSTRUCTIONS_JETPACK_VERSION = '4.2.0';

class JetpackInstallStep extends Component {
	static propTypes = {
		confirmJetpackInstallStatus: PropTypes.func.isRequired,
		currentUrl: PropTypes.string,
		jetpackVersion: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		onClick: PropTypes.func,
	};

	static defaultProps = {
		currentUrl: '',
		onClick: noop,
	};

	confirmJetpackInstalled = ( event ) => {
		event.preventDefault();
		this.props.confirmJetpackInstallStatus( true );
	};

	confirmJetpackNotInstalled = ( event ) => {
		event.preventDefault();
		this.props.confirmJetpackInstallStatus( false );
	};

	renderAlreadyHaveJetpackButton() {
		return (
			<a
				className="jetpack-connect__already-installed-jetpack-button"
				href="#"
				onClick={ this.confirmJetpackInstalled }
			>
				{ preventWidows( this.props.translate( 'Already have Jetpack installed?' ) ) }
			</a>
		);
	}

	renderNotJetpackButton() {
		return (
			<a
				className="jetpack-connect__no-jetpack-button"
				href="#"
				onClick={ this.confirmJetpackNotInstalled }
			>
				{ preventWidows( this.props.translate( "Don't have Jetpack installed?" ) ) }
			</a>
		);
	}

	getStep( stepName ) {
		const { currentUrl, jetpackVersion, onClick, translate } = this.props;

		const isLegacyVersion =
			jetpackVersion && versionCompare( jetpackVersion, NEW_INSTRUCTIONS_JETPACK_VERSION, '<' );

		const jetpackConnectExample = (
			<JetpackExampleConnect url={ currentUrl } isLegacy={ isLegacyVersion } onClick={ onClick } />
		);

		const steps = {
			installJetpack: {
				title: translate( '1. Install Jetpack' ),
				text: translate(
					"Click the green “Install Jetpack” button below. You'll be redirected to the " +
						"Jetpack plugin page on your site’s wp-admin dashboard, where you'll " +
						'then click the blue “Install Now” button.'
				),
				action: this.renderAlreadyHaveJetpackButton(),
				example: <JetpackExampleInstall url={ currentUrl } onClick={ onClick } />,
			},
			activateJetpackAfterInstall: {
				title: translate( '2. Activate Jetpack' ),
				text: translate( 'Next, click the blue “Activate Plugin” button to activate Jetpack.' ),
				action: null,
				example: (
					<JetpackExampleActivate url={ currentUrl } isInstall={ true } onClick={ onClick } />
				),
			},
			connectJetpackAfterInstall: {
				title: translate( '3. Connect Jetpack' ),
				text: translate( 'Finally, click the “Set up Jetpack” button to finish the process.' ),
				action: null,
				example: jetpackConnectExample,
			},
			activateJetpack: {
				title: translate( '1. Activate Jetpack' ),
				text: translate(
					"You'll be redirected to the Plugins page on your site’s wp-admin " +
						"dashboard, where you'll then Click the blue “Activate” link. "
				),
				action: this.renderNotJetpackButton(),
				example: (
					<JetpackExampleActivate url={ currentUrl } isInstall={ false } onClick={ onClick } />
				),
			},
			connectJetpack: {
				title: translate( '2. Connect Jetpack' ),
				text: translate( 'Then click the “Set up Jetpack” button to finish the process.' ),
				action: null,
				example: jetpackConnectExample,
			},
		};
		return steps[ stepName ];
	}

	render() {
		const step = this.getStep( this.props.stepName );
		return (
			<Card className="jetpack-connect__install-step">
				<div className="jetpack-connect__install-step-title">{ step.title }</div>
				<div className="jetpack-connect__install-step-text">
					<span>
						{ preventWidows( step.text ) }
						&nbsp;
						{ step.action }
					</span>
				</div>
				{ step.example }
			</Card>
		);
	}
}

export default localize( JetpackInstallStep );
