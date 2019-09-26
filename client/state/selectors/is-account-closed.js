/**
 * External dependencies
 */
import { get } from 'lodash';

export default function isAccountClosed( state ) {
	return get( state, [ 'account', 'isClosed' ], false );
}
