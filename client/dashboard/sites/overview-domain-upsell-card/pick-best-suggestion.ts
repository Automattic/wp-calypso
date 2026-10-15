import type { DomainSuggestion } from '@automattic/api-core';

const normalize = ( value: string ) => value.toLowerCase().replace( /[^a-z0-9]/g, '' );

const getSld = ( domainName: string ) => domainName.split( '.' )[ 0 ];

const countHyphens = ( value: string ) => ( value.match( /-/g ) ?? [] ).length;

/**
 * A suggestion introduces hyphens when its SLD has more hyphens than the search
 * term. This is how the `domain-upsell` vendor mangles a query (turning
 * "examplesite" into "ex-ample-site", or "my-site" into "m-y-s-i-t-e"), so such results
 * are never trustworthy. Comparing counts rather than mere presence keeps the
 * guard working for search terms that legitimately contain a hyphen.
 */
const introducesHyphens = ( sld: string, search: string ) =>
	countHyphens( sld ) > countHyphens( search );

/**
 * Picks the best domain suggestion for an upsell instead of blindly trusting the
 * top-ranked result. The `domain-upsell` vendor sometimes ranks a mangled,
 * hyphenated respelling (e.g. "ex-ample-site.com") above the clean exact match for a
 * clean query like "examplesite", so we prefer a clean exact match and otherwise
 * reject top results that introduce hyphens the search term doesn't have.
 */
export function pickBestSuggestion(
	suggestions: DomainSuggestion[] | undefined,
	search: string
): DomainSuggestion | undefined {
	if ( ! suggestions?.length ) {
		return undefined;
	}

	const normalizedSearch = normalize( search );

	const exactMatches = suggestions.filter( ( suggestion ) => {
		const sld = getSld( suggestion.domain_name );
		return normalize( sld ) === normalizedSearch && ! introducesHyphens( sld, search );
	} );
	if ( exactMatches.length > 0 ) {
		return (
			exactMatches.find( ( suggestion ) =>
				suggestion.domain_name.toLowerCase().endsWith( '.com' )
			) ?? exactMatches[ 0 ]
		);
	}

	const [ topSuggestion ] = suggestions;
	if ( ! introducesHyphens( getSld( topSuggestion.domain_name ), search ) ) {
		return topSuggestion;
	}

	return undefined;
}
