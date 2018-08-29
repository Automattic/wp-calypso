/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
//import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import QueryAccountRecoverySettings from 'components/data/query-account-recovery-settings';
import QueryApplicationPasswords from 'components/data/query-application-passwords';
import QueryConnectedApplications from 'components/data/query-connected-applications';
import QueryUserSettings from 'components/data/query-user-settings';
import AccountHealthCheckDialog from './dialog';
import { showAccountCheckDialog } from 'state/ui/account-health-check/actions';
import {
	getCurrentUserDate,
	//isCurrentUserEmailVerified,
	isUserLoggedIn,
} from 'state/current-user/selectors';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:account-health-check' );

// @TODO split out the query components
class AccountHealthCheck extends Component {
	maybeInitializeTwoFactorLib = () => {
		const { isLoggedIn, twoStepIsInitialized } = this.props;
		if ( ! isLoggedIn || twoStepIsInitialized ) {
			return;
		}

		// Initializes the 2fa lib. Fetches status & dispatches an action to fill redux state
		require( 'lib/two-step-authorization' );
		debug( 'Initializing 2fa lib' );
	};

	componentDidMount() {
		this.maybeInitializeTwoFactorLib();
	}

	componentDidUpdate( prevProps ) {
		const { twoStepIsInitialized, twoStepIsReauthorizationRequired, userRegistered } = this.props;

		if ( prevProps.twoStepIsInitialized ) {
			return;
		}

		this.maybeInitializeTwoFactorLib();

		if ( ! twoStepIsInitialized ) {
			debug( 'twoStepAuthorization still not initialized' );
			return;
		}

		if ( twoStepIsReauthorizationRequired ) {
			// @TODO do something meaningful when reauthorization is required
			debug( 'twoStepAuthorization reauth required' );
			return;
		}

		debug( 'twoStepAuthorization initialied' );

		debug( { userRegistered } );

		// @TODO impose a brief delay
		// @TODO do a check to see if user is eligible
		this.props.showAccountCheckDialog();
	}

	render() {
		const { twoStepIsInitialized, twoStepIsReauthorizationRequired } = this.props;

		if ( ! twoStepIsInitialized ) {
			debug( '[render] twoStepAuthorization not initialized' );
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
				<AccountHealthCheckDialog />
			</Fragment>
		);
	}
}

export default connect(
	state => {
		return {
			userRegistered: getCurrentUserDate( state ),
			isLoggedIn: isUserLoggedIn( state ),
			// @TODO make these proper selectors alongside `twoStepIsEnabled` selector
			twoStepIsInitialized: get( state, 'account.twoFactorAuthentication.isInitialized' ),
			twoStepIsReauthorizationRequired: get(
				state,
				'account.twoFactorAuthentication.isReauthorizationRequired'
			),
		};
	},
	{ showAccountCheckDialog }
)( AccountHealthCheck );
