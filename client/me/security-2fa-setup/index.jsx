/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Security2faEnable from 'me/security-2fa-enable';
import Security2faSetupBackupCodes from 'me/security-2fa-setup-backup-codes';
import Security2faSMSSettings from 'me/security-2fa-sms-settings';
import Security2faInitialSetup from 'me/security-2fa-initial-setup';
import { successNotice } from 'state/notices/actions';

class Security2faSetup extends Component {
	static propTypes = {
		onFinished: PropTypes.func.isRequired,
		userSettings: PropTypes.object.isRequired,
		translate: PropTypes.func,
	};

	constructor() {
		super( ...arguments );
		this.state = {
			step: 'initial-setup',
		};
	}

	onCancelSetup = ( event ) => {
		event.preventDefault();
		this.setState( { step: 'initial-setup' } );
	};

	onInitialSetupSuccess = () => {
		this.setState( { step: 'sms-settings' } );
	};

	onSetupSuccess = () => {
		this.setState( { step: 'backup-codes' } );
	};

	onFinished = () => {
		this.props.successNotice(
			this.props.translate( 'Successfully enabled Two-Step Authentication.' ),
			{
				duration: 4000,
			}
		);
		this.props.onFinished();
	};

	onVerifyByApp = () => {
		this.setState( { step: 'app-based' } );
	};

	onVerifyBySMS = () => {
		this.setState( { step: 'sms-based' } );
	};

	render() {
		return (
			<div className="security-2fa-setup__steps-container">
				{ 'initial-setup' === this.state.step ? (
					<Security2faInitialSetup onSuccess={ this.onInitialSetupSuccess } />
				) : null }

				{ 'sms-settings' === this.state.step ? (
					<Security2faSMSSettings
						userSettings={ this.props.userSettings }
						onCancel={ this.onCancelSetup }
						onVerifyByApp={ this.onVerifyByApp }
						onVerifyBySMS={ this.onVerifyBySMS }
					/>
				) : null }

				{ 'app-based' === this.state.step ? (
					<Security2faEnable
						doSMSFlow={ false }
						onCancel={ this.onCancelSetup }
						onSuccess={ this.onSetupSuccess }
						userSettings={ this.props.userSettings }
					/>
				) : null }

				{ 'sms-based' === this.state.step ? (
					<Security2faEnable
						doSMSFlow
						onCancel={ this.onCancelSetup }
						onSuccess={ this.onSetupSuccess }
						userSettings={ this.props.userSettings }
					/>
				) : null }

				{ 'backup-codes' === this.state.step ? (
					<Security2faSetupBackupCodes onFinished={ this.onFinished } />
				) : null }
			</div>
		);
	}
}

export default connect( null, { successNotice }, null, { pure: false } )(
	localize( Security2faSetup )
);
