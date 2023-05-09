import { get } from 'lodash';

import 'calypso/state/account/init';

export default function isAccountClosed( state ) {
	return get( state, [ 'account', 'isClosed' ], false );
}
