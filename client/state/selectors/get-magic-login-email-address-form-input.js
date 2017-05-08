/**
 * External dependencies
 */
import { get } from 'lodash';

export default function getMagicLoginEmailAddressFormInput( state ) {
	return get( state, 'login.magicLogin.emailAddressFormInput', '' );
}
