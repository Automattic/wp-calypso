import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import JetpackExampleActivate from './example-components/jetpack-activate';
import JetpackExampleConnect from './example-components/jetpack-connect';
import JetpackExampleInstall from './example-components/jetpack-install';

const noop = () => {};

class JetpackInstallStep extends Component {
	static propTypes = {
		confirmJetpackInstallStatus: PropTypes.func.isRequired,
		currentUrl: PropTypes.string,
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
			// eslint-disable-next-line jsx-a11y/anchor-is-valid
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
			// eslint-disable-next-line jsx-a11y/anchor-is-valid
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
		const { currentUrl, onClick, translate } = this.props;

		const jetpackConnectExample = <JetpackExampleConnect url={ currentUrl } onClick={ onClick } />;

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
				example: <JetpackExampleActivate url={ currentUrl } isInstall onClick={ onClick } />,
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
