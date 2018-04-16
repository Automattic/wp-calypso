/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UserItem from '../index';
import user from 'lib/user';

function UserItemExample() {
	const currentUser = user().get();
	const currentUserData = Object.assign( {}, currentUser, { name: currentUser.display_name } );
	return <UserItem user={ currentUserData } />;
}

UserItemExample.displayName = 'UserItem';

export default UserItemExample;
