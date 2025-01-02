import { get } from 'lodash';

import 'calypso/state/account/init';

export default function isAccountDeleting( state ) {
	return get( state, [ 'account', 'isDeleting' ], false );
}
