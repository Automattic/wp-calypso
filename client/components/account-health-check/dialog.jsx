/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
} from 'state/account-recovery/settings/selectors';
import getApplicationPasswords from 'state/selectors/get-application-passwords';
import getConnectedApplications from 'state/selectors/get-connected-applications';
import { getCurrentUserDisplayName, getCurrentUserEmail } from 'state/current-user/selectors';
import isAccountHealthCheckDialogShowing from 'state/selectors/is-account-health-check-dialog-showing';
import {
	hideAccountCheckDialog,
	showAccountCheckDialog,
} from 'state/ui/account-health-check/actions';
import CloseOnEscape from 'components/close-on-escape';
import Dialog from 'components/dialog';

// @TODO split out the query components
class AccountHealthCheckDialog extends Component {
	/*
	static propTypes = {
		applicationPasswordCount: null,
		accountRecoveryEmail: null,
		accountRecoveryPhone: null,
		displayName: null,
		email: null,
		isShowingDialog: null,
		twoStepIsEnabled: null,
	};*/

	closeDialog = () => {
		this.props.hideAccountCheckDialog();
	};

	render() {
		const {
			applicationPasswordCount,
			accountRecoveryEmail,
			accountRecoveryPhone,
			displayName,
			email,
			isShowingDialog,
			twoStepIsEnabled,
			twoStepIsReauthorizationRequired,
		} = this.props;

		if ( twoStepIsReauthorizationRequired ) {
			return null;
		}

		return (
			<Dialog isVisible={ isShowingDialog } onClose={ this.closeDialog }>
				<div>Hi, { displayName }!</div>
				<div>Please take a minute to confirm your account settings</div>
				<div>Email Address: { email }</div>
				<div>Account Recovery Email: { accountRecoveryEmail }</div>
				<div>Account Recovery Phone #: { accountRecoveryPhone }</div>
				{ applicationPasswordCount > 0 && (
					<div>Application Passwords: { applicationPasswordCount }</div>
				) }
				<div>Two Factor Authentication: { twoStepIsEnabled ? 'Enabled' : 'Not enabled' }</div>
				<CloseOnEscape onEscape={ this.closeDialog } />
			</Dialog>
		);
	}
}

export default connect(
	state => {
		return {
			accountRecoveryEmail: getAccountRecoveryEmail( state ),
			accountRecoveryPhone: getAccountRecoveryPhone( state ),
			applicationPasswordCount: getApplicationPasswords( state ).length,
			connectedApplicationCount: getConnectedApplications( state ),
			displayName: getCurrentUserDisplayName( state ),
			email: getCurrentUserEmail( state ),
			isShowingDialog: isAccountHealthCheckDialogShowing( state ),

			// @TODO make these proper selectors & make state tree work with `twoStepIsEnabled` selector
			twoStepIsEnabled: get( state, 'account.twoFactorAuthentication.isEnabled' ),
			twoStepIsReauthorizationRequired: get(
				state,
				'account.twoFactorAuthentication.isReauthorizationRequired'
			),
		};
	},
	{ hideAccountCheckDialog, showAccountCheckDialog }
)( AccountHealthCheckDialog );
