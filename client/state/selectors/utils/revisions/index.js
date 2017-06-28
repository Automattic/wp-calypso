/**
 * External dependencies
 */
import { cloneDeep, get } from 'lodash';

/**
 * Internal dependencies
 */
import decodeEntities from 'lib/post-normalizer/rule-decode-entities';
import { normalizePostForDisplay } from 'state/posts/utils';

export const normalizeForDisplay = normalizePostForDisplay;
export function normalizeForEditing( revision ) {
	if ( ! revision ) {
		return null;
	}

	return decodeEntities( cloneDeep( revision ) );
}

export function hydrateRevision( state, revision ) {
	if ( ! revision ) {
		return revision;
	}

	const author = get( state.users.items, revision.author );
	if ( ! author ) {
		return revision;
	}

	return {
		...revision,
		author,
	};
}
