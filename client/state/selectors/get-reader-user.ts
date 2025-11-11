import { UserProfileData } from 'calypso/lib/user/user';
import { AppState } from 'calypso/types';

/**
 * Get the progress details of a restore for a specified site
 * @param {AppState} state Global state tree
 * @param {number | string} userIdOrLogin id or login of user
 * @param {?boolean} findById if true, find the user by id
 * @returns {UserProfileData} User details
 */
export default function getReaderUser(
	state: AppState,
	userIdOrLogin: number | string,
	findById?: boolean | undefined
): UserProfileData | undefined {
	if ( findById ) {
		return (
			( Object.values( state.reader.users.items ) as ( UserProfileData | null )[] ).find(
				( user ) => {
					return Number( user?.ID ) === Number( userIdOrLogin );
				}
			) ?? undefined
		);
	}
	return state.reader.users.items[ userIdOrLogin ];
}
