/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import UserItem from '../index';
import { getCurrentUser } from 'state/current-user/selectors';

const UserItemExample = ( { currentUser } ) => {
	return <UserItem user={ currentUser } />;
};

const ConnectedUserItemExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return {};
	}
	const currentUser = Object.assign( {}, user, { name: user.display_name } );

	return {
		currentUser,
	};
} )( UserItemExample );

ConnectedUserItemExample.displayName = 'UserItem';

export default ConnectedUserItemExample;
