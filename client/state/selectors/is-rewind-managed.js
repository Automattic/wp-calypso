/** @format */

/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { getRewindState } from 'state/selectors';

export default function isRewindManaged( state, siteId ) {
	const rewind = getRewindState( state, siteId );
	const credentials = find( rewind.credentials, { role: 'main' } );

	return credentials && credentials.type && 'managed' === credentials.type;
}
