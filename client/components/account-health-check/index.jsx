/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';
import {
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
} from 'state/account-recovery/settings/selectors';
import getApplicationPasswords from 'state/selectors/get-application-passwords';
import getConnectedApplications from 'state/selectors/get-connected-applications';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:account-health-check' );

const AccountHealthCheck = props => {
	debug( props );
	return 'ohai';
};

export default connect( state => {
	const currentUser = getCurrentUser( state );

	return {
		accountRecoveryEmail: getAccountRecoveryEmail( state ),
		accountRecoveryPhone: getAccountRecoveryPhone( state ),
		applicationPasswordCount: getApplicationPasswords( state ).length,
		connectedApplicationCount: getConnectedApplications( state ),
		displayName: currentUser.display_name,
		email: currentUser.email,
	};
} )( AccountHealthCheck );
