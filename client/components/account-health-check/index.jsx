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
import { getCurrentUser } from 'state/current-user/selectors';
import {
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
} from 'state/account-recovery/settings/selectors';
import getApplicationPasswords from 'state/selectors/get-application-passwords';
import getConnectedApplications from 'state/selectors/get-connected-applications';
import debugFactory from 'debug';

// `lib/two-step-authorization` instantiates a singleton, initializes, & fetches when imported
/* eslint-disable no-unused-vars */
import twoStepAuthorization from 'lib/two-step-authorization';
/* eslint-enable no-unused-vars */

const debug = debugFactory( 'calypso:account-health-check' );

// @TODO split out the query components
class AccountHealthCheck extends Component {
	render() {
		const { twoStepIsInitialized, twoStepIsReauthorizationRequired } = this.props;

		if ( ! twoStepIsInitialized ) {
			debug( 'twoStepAuthorization initializing' );
			return null;
		}

		if ( twoStepIsReauthorizationRequired ) {
			debug( 'twoStepAuthorization reauth required' );
			return null;
		}

		return (
			<Fragment>
				<QueryAccountRecoverySettings />
				<QueryApplicationPasswords />
				<QueryConnectedApplications />
				<QueryUserSettings />
			</Fragment>
		);
	}
}

export default connect( state => {
	const currentUser = getCurrentUser( state );

	return {
		accountRecoveryEmail: getAccountRecoveryEmail( state ),
		accountRecoveryPhone: getAccountRecoveryPhone( state ),
		applicationPasswordCount: getApplicationPasswords( state ).length,
		connectedApplicationCount: getConnectedApplications( state ),
		displayName: currentUser.display_name,
		email: currentUser.email,

		// @TODO make these proper selectors & make state tree work with `twoStepIsEnabled` selector
		twoStepIsInitialized: get( state, 'account.twoFactorAuthentication.isInitialized' ),
		twoStepIsReauthorizationRequired: get(
			state,
			'account.twoFactorAuthentication.isReauthorizationRequired'
		),
	};
} )( AccountHealthCheck );
