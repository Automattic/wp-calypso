/**
 * Internal dependencies
 */
import { READER_ORGANIZATIONS_REQUEST } from 'state/reader/action-types';

import 'state/data-layer/wpcom/read/organizations';
import 'state/reader/init';

export function requestOrganizations() {
	return {
		type: READER_ORGANIZATIONS_REQUEST,
	};
}
