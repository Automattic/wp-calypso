/**
 * External dependencies
 */
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import { receiveUser } from './actions';

export async function getUser() {
	const user = await wpcom.me().get();
	return receiveUser( user );
}
