/**
 * External dependencies
 */

import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import usersData from './users';
import moreUsersData from './more-users';

const clonedMoreUsers = cloneDeep( moreUsersData.users );
const updatedUsers = clonedMoreUsers.map( ( user ) => {
	return Object.assign( {}, user, { roles: [ 'contributor' ] } );
} );

export default {
	found: 7,
	users: [].concat( usersData.users ).concat( updatedUsers ),
};
