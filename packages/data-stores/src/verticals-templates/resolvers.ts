/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveTemplates } from './actions';
import type { getTemplates as getTemplatesSelector } from './selectors';
import type { Template } from './types';

export function* getTemplates(
	// Resolver has the same signature as corresponding selector without the initial state argument
	verticalId: Parameters< typeof getTemplatesSelector >[ 1 ]
) {
	const resp: { templates: Template[] } = yield apiFetch( {
		url: `https://public-api.wordpress.com/wpcom/v2/verticals/${ verticalId }/templates`,
	} );

	return receiveTemplates( verticalId, resp.templates );
}
