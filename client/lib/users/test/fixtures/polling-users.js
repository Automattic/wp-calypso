/**
 * External dependencies
 */
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import moreUsersData from './more-users';
import usersData from './users';

const clonedMoreUsers = cloneDeep( moreUsersData.users );
const updatedUsers = clonedMoreUsers.map( ( user ) => {
	return Object.assign( {}, user, { roles: [ 'contributor' ] } );
} );

export default {
	found: 7,
	users: Array.concat( usersData.users, updatedUsers )
};
