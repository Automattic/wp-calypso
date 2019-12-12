/**
 * External dependencies
 */

import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AppPasswords from 'me/application-passwords';
import { Card } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import ReauthRequired from 'me/reauth-required';
import Security2faBackupCodes from 'me/security-2fa-backup-codes';
import Security2faDisable from 'me/security-2fa-disable';
import Security2faSetup from 'me/security-2fa-setup';
import SecuritySectionNav from 'me/security-section-nav';
import Security2faKey from 'me/security-2fa-key';
import twoStepAuthorization from 'lib/two-step-authorization';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import config from 'config';

/**
 * Style dependencies
 */
import './style.scss';

const debug = debugFactory( 'calypso:me:two-step' );

class TwoStep extends Component {
	static displayName = 'TwoStep';

	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	state = {
		initialized: false,
		doingSetup: false,
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
		this.props.userSettings.on( 'change', this.onUserSettingsChange );
		this.props.userSettings.fetchSettings();
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component is unmounting.' );
		this.props.userSettings.off( 'change', this.onUserSettingsChange );
	}

	onUserSettingsChange = () => {
		// NOTE: This was removed to transform to React.Component.
		// Ensure no behavior change from this omission.
		// if ( ! this.isMounted() ) {
		// 	return;
		// }

		if ( ! this.state.initialized ) {
			this.setState( {
				initialized: true,
				doingSetup: ! this.props.userSettings.isTwoStepEnabled(),
			} );
			return;
		}

		// are we doing setup? don't re-render during the setup flow
		if ( this.state.doingSetup ) {
			return;
		}

		this.forceUpdate();
	};

	onSetupFinished = () => {
		this.setState(
			{
				doingSetup: false,
			},
			this.refetchSettings
		);
	};

	onDisableFinished = () => {
		this.setState(
			{
				doingSetup: true,
			},
			this.refetchSettings
		);
	};

	refetchSettings = () => {
		this.props.userSettings.fetchSettings();
	};

	renderPlaceholders = () => {
		const placeholders = [];

		for ( let i = 0; i < 5; i++ ) {
			placeholders.push(
				<p className="two-step__placeholder-text" key={ '2fa-placeholder' + i }>
					{ ' ' }
					&nbsp;{ ' ' }
				</p>
			);
		}

		return placeholders;
	};

	renderTwoStepSection = () => {
		if ( ! this.state.initialized ) {
			return this.renderPlaceholders();
		}

		if ( this.state.doingSetup ) {
			return (
				<Security2faSetup
					userSettings={ this.props.userSettings }
					onFinished={ this.onSetupFinished }
				/>
			);
		}

		return (
			<Security2faDisable
				userSettings={ this.props.userSettings }
				onFinished={ this.onDisableFinished }
			/>
		);
	};

	renderApplicationPasswords = () => {
		if ( ! this.state.initialized || this.state.doingSetup ) {
			return null;
		}

		return <AppPasswords />;
	};

	render2faKey = () => {
		if ( ! this.state.initialized || this.state.doingSetup ) {
			return null;
		}

		return <Security2faKey />;
	};

	renderBackupCodes = () => {
		if ( ! this.state.initialized || this.state.doingSetup ) {
			return null;
		}

		return <Security2faBackupCodes userSettings={ this.props.userSettings } />;
	};

	render() {
		return (
			<Main className="two-step">
				<PageViewTracker path="/me/security/two-step" title="Me > Two-Step Authentication" />
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<DocumentHead title={ this.props.translate( 'Two-Step Authentication' ) } />

				<Card>{ this.renderTwoStepSection() }</Card>

				{ config.isEnabled( '2fa/keys-support' ) && this.render2faKey() }
				{ this.renderBackupCodes() }
				{ this.renderApplicationPasswords() }
			</Main>
		);
	}
}

export default localize( TwoStep );
