/**
 * Internal dependencies
 */
import { READER_ORGANIZATIONS_REQUEST } from 'calypso/state/reader/action-types';

import 'calypso/state/data-layer/wpcom/read/organizations';
import 'calypso/state/reader/init';

export function requestOrganizations() {
	return {
		type: READER_ORGANIZATIONS_REQUEST,
	};
}
