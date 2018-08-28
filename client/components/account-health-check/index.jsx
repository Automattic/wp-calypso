/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import QueryAccountRecoverySettings from 'components/data/query-account-recovery-settings';
import QueryApplicationPasswords from 'components/data/query-application-passwords';
import QueryConnectedApplications from 'components/data/query-connected-applications';
import QueryUserSettings from 'components/data/query-user-settings';
import Dialog from 'components/dialog';
import CloseOnEscape from 'components/close-on-escape';
import { getCurrentUser } from 'state/current-user/selectors';
import {
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
} from 'state/account-recovery/settings/selectors';
import getApplicationPasswords from 'state/selectors/get-application-passwords';
import getConnectedApplications from 'state/selectors/get-connected-applications';
import isAccountHealthCheckDialogShowing from 'state/selectors/is-account-health-check-dialog-showing';
import {
	hideAccountCheckDialog,
	showAccountCheckDialog,
} from 'state/ui/account-health-check/actions';
import debugFactory from 'debug';

// `lib/two-step-authorization` instantiates a singleton, initializes, & fetches when imported
/* eslint-disable no-unused-vars */
import twoStepAuthorization from 'lib/two-step-authorization';
/* eslint-enable no-unused-vars */

const debug = debugFactory( 'calypso:account-health-check' );

// @TODO split out the query components
class AccountHealthCheck extends Component {
	closeDialog = () => {
		this.props.hideAccountCheckDialog();
	};

	componentDidUpdate( prevProps ) {
		if ( prevProps.twoStepIsInitialized ) {
			// There can be only one
			return;
		}

		if ( this.props.twoStepIsReauthorizationRequired ) {
			// @TODO do something meaningful when reauthorization is required
			debug( 'twoStepAuthorization reauth required' );
			return;
		}

		if ( this.props.twoStepIsInitialized ) {
			// @TODO impose a brief delay
			// @TODO do a check to see if user is eligible
			this.props.showAccountCheckDialog();
		}
	}

	render() {
		const {
			applicationPasswordCount,
			accountRecoveryEmail,
			accountRecoveryPhone,
			displayName,
			email,
			isShowingDialog,
			twoStepIsEnabled,
			twoStepIsInitialized,
			twoStepIsReauthorizationRequired,
		} = this.props;

		if ( ! twoStepIsInitialized ) {
			debug( 'twoStepAuthorization initializing' );
			return null;
		}

		if ( twoStepIsReauthorizationRequired ) {
			// Prevent "An error occurred while fetching your account recovery settings." message
			return null;
		}

		return (
			<Fragment>
				<QueryAccountRecoverySettings />
				<QueryApplicationPasswords />
				<QueryConnectedApplications />
				<QueryUserSettings />
				<Dialog isVisible={ isShowingDialog } onClose={ this.closeDialog }>
					<div>Hi, { displayName }!</div>
					<div>Hi! Please take a minute to confirm your account settings</div>
					<div>Email Address: { email }</div>
					<div>Account Recovery Email: { accountRecoveryEmail }</div>
					<div>Account Recovery Phone #: { accountRecoveryPhone }</div>
					{ applicationPasswordCount > 0 && (
						<div>Application Passwords: { applicationPasswordCount }</div>
					) }
					<div>Two Factor Authentication: { twoStepIsEnabled ? 'Enabled' : 'Not enabled' }</div>
					<CloseOnEscape onEscape={ this.closeDialog } />
				</Dialog>
			</Fragment>
		);
	}
}

export default connect(
	state => {
		const currentUser = getCurrentUser( state );

		return {
			accountRecoveryEmail: getAccountRecoveryEmail( state ),
			accountRecoveryPhone: getAccountRecoveryPhone( state ),
			applicationPasswordCount: getApplicationPasswords( state ).length,
			connectedApplicationCount: getConnectedApplications( state ),
			displayName: currentUser.display_name,
			email: currentUser.email,
			isShowingDialog: isAccountHealthCheckDialogShowing( state ),

			// @TODO make these proper selectors & make state tree work with `twoStepIsEnabled` selector
			twoStepIsEnabled: get( state, 'account.twoFactorAuthentication.isEnabled' ),
			twoStepIsInitialized: get( state, 'account.twoFactorAuthentication.isInitialized' ),
			twoStepIsReauthorizationRequired: get(
				state,
				'account.twoFactorAuthentication.isReauthorizationRequired'
			),
		};
	},
	{ hideAccountCheckDialog, showAccountCheckDialog }
)( AccountHealthCheck );
