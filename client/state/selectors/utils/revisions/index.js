/**
 * External dependencies
 */
import { cloneDeep, get, identity } from 'lodash';

/**
 * Internal dependencies
 */
import decodeEntities from 'lib/post-normalizer/rule-decode-entities';

function normalizeForDisplay( revision ) {
	if ( ! revision ) {
		return null;
	}

	return decodeEntities( cloneDeep( revision ), [ 'content', 'excerpt', 'title', 'site_name' ] );
}

function normalizeForEditing( revision ) {
	if ( ! revision ) {
		return null;
	}

	return decodeEntities( cloneDeep( revision ) );
}

const NORMALIZER_MAPPING = {
	display: normalizeForDisplay,
	editing: normalizeForEditing,
};

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

export function normalizeRevision( normalizerName, revision ) {
	return get( NORMALIZER_MAPPING, normalizerName, identity )( revision );
}
