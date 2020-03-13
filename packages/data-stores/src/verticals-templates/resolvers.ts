/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import { receiveTemplates, receiveVerticalTemplate } from './actions';

export function* getTemplates(
	// Resolver has the same signature as corresponding selector without the initial state argument
	verticalId: Parameters< typeof import('./selectors')[ 'getTemplates' ] >[ 1 ]
) {
	const resp = yield apiFetch( {
		url: `https://public-api.wordpress.com/wpcom/v2/verticals/${ encodeURIComponent(
			verticalId
		) }/templates`,
	} );

	return receiveTemplates( verticalId, resp.templates );
}

export function* getVerticalTemplate(
	// Resolver has the same signature as corresponding selector without the initial state argument
	verticalId: Parameters< typeof import('./selectors')[ 'getVerticalTemplate' ] >[ 1 ],
	templateSlug: Parameters< typeof import('./selectors')[ 'getVerticalTemplate' ] >[ 2 ]
) {
	const resp = yield apiFetch( {
		url: `https://public-api.wordpress.com/wpcom/v2/verticals/${ encodeURIComponent(
			verticalId
		) }/templates/${ encodeURIComponent( templateSlug ) }`,
	} );

	return receiveVerticalTemplate( verticalId, templateSlug, resp );
}
