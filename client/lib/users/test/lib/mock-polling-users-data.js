/**
 * External dependencies
 */
import cloneDeep from 'lodash/cloneDeep';

/**
 * Internal dependencies
 */
import usersData from './mock-users-data';
import moreUsersData from './mock-more-users-data';

const clonedMoreUsers = cloneDeep( moreUsersData.users );
const updatedUsers = clonedMoreUsers.map( ( user ) => {
	return Object.assign( {}, user, { roles: [ 'contributor' ] } );
} );

export default {
	found: 7,
	users: Array.concat( usersData.users, updatedUsers )
};
