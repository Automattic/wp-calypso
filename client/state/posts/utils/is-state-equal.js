/**
 * External dependencies
 */
import { includes } from 'lodash';

export function isStatusEqual( localStatusEdit, savedStatus ) {
	// When receiving a request to change the `status` attribute, the server
	// treats `publish` and `future` as synonyms. It's really the post's `date`
	// that determines the resulting status, not the requested value.
	// Therefore, the `status` edit is considered saved and removed from the
	// local edits even if the value returned by server is different.
	if ( includes( [ 'publish', 'future' ], localStatusEdit ) ) {
		return includes( [ 'publish', 'future' ], savedStatus );
	}

	// All other statuses (draft, private, pending) are 1:1. The only possible
	// exception is requesting `publish` and not having rights to publish new
	// posts. Then the server sets a `pending` status. But we check for this case
	// in the UI and request `pending` instead of `publish` if the user doesn't
	// have the rights.
	return localStatusEdit === savedStatus;
}
