/**
 * Internal Dependencies
 */
import User from './user';

let _user = false;

export default function () {
	if ( ! _user ) {
		_user = new User();
	}
	return _user;
}
