import { getTld } from './get-tld';

export type FeaturedSuggestionReason = 'exact-match' | 'recommended' | 'best-alternative';

export interface FeaturedSuggestionWithReason {
	suggestion: string;
	reason: FeaturedSuggestionReason;
}

interface PartitionedSuggestions {
	featuredSuggestions: FeaturedSuggestionWithReason[];
	regularSuggestions: string[];
}

interface PartitionSuggestionsParams {
	suggestions: string[];
	query: string;
	emphasizedTlds: string[];
	deemphasizedTlds: string[];
}

const MAX_FEATURED_SLOTS = 3;

const partitionWithEmphasis = ( {
	suggestions,
	query,
	emphasizedTlds,
	deemphasizedTlds,
}: PartitionSuggestionsParams ): PartitionedSuggestions => {
	const featuredSuggestions: FeaturedSuggestionWithReason[] = [];
	const featuredSet = new Set< string >();

	// When the query has no TLD, promote `{query}.com` to the exact-match slot so
	// `.com` keeps the top spot even with emphasized TLDs in play.
	if ( ! getTld( query ) ) {
		const queryDotCom = `${ query }.com`;
		if ( suggestions.includes( queryDotCom ) ) {
			featuredSuggestions.push( { suggestion: queryDotCom, reason: 'exact-match' } );
			featuredSet.add( queryDotCom );
		}
	}

	for ( const tld of emphasizedTlds ) {
		if ( featuredSuggestions.length >= MAX_FEATURED_SLOTS ) {
			break;
		}
		const match = suggestions.find(
			( suggestion ) => ! featuredSet.has( suggestion ) && getTld( suggestion ) === tld
		);
		if ( ! match ) {
			continue;
		}
		const reason: FeaturedSuggestionReason = featuredSuggestions.some(
			( featured ) => featured.reason === 'recommended'
		)
			? 'best-alternative'
			: 'recommended';
		featuredSuggestions.push( { suggestion: match, reason } );
		featuredSet.add( match );
	}

	const remainingEmphasized: string[] = [];
	const others: string[] = [];
	const deemphasized: string[] = [];

	for ( const suggestion of suggestions ) {
		if ( featuredSet.has( suggestion ) ) {
			continue;
		}
		const tld = getTld( suggestion );
		if ( deemphasizedTlds.includes( tld ) ) {
			deemphasized.push( suggestion );
			continue;
		}
		if ( emphasizedTlds.includes( tld ) ) {
			remainingEmphasized.push( suggestion );
			continue;
		}
		others.push( suggestion );
	}

	const byTldOrder = ( order: string[] ) => ( a: string, b: string ) =>
		order.indexOf( getTld( a ) ) - order.indexOf( getTld( b ) );
	remainingEmphasized.sort( byTldOrder( emphasizedTlds ) );
	deemphasized.sort( byTldOrder( deemphasizedTlds ) );

	return {
		featuredSuggestions,
		regularSuggestions: [ ...remainingEmphasized, ...others, ...deemphasized ],
	};
};

export const partitionSuggestions = ( {
	suggestions,
	query,
	emphasizedTlds,
	deemphasizedTlds,
}: PartitionSuggestionsParams ): PartitionedSuggestions => {
	const exactMatch = suggestions.find( ( suggestion ) => suggestion === query );

	// If we have an exact match, we always want to show it at the top, even if the TLD is deemphasized
	if ( exactMatch ) {
		return {
			featuredSuggestions: [
				{
					suggestion: exactMatch,
					reason: 'exact-match',
				},
			],
			regularSuggestions: suggestions.filter( ( suggestion ) => suggestion !== query ),
		};
	}

	if ( emphasizedTlds.length > 0 ) {
		return partitionWithEmphasis( {
			suggestions,
			query,
			emphasizedTlds,
			deemphasizedTlds,
		} );
	}

	const featuredSuggestions: FeaturedSuggestionWithReason[] = [];
	const regularSuggestions: string[] = [];

	for ( const suggestion of suggestions ) {
		if ( deemphasizedTlds.some( ( tld ) => getTld( suggestion ) === tld ) ) {
			regularSuggestions.push( suggestion );
			continue;
		}

		if ( ! featuredSuggestions.find( ( { reason } ) => reason === 'recommended' ) ) {
			featuredSuggestions.push( {
				suggestion: suggestion,
				reason: 'recommended',
			} );
			continue;
		}

		if ( ! featuredSuggestions.find( ( { reason } ) => reason === 'best-alternative' ) ) {
			featuredSuggestions.push( {
				suggestion: suggestion,
				reason: 'best-alternative',
			} );
			continue;
		}

		regularSuggestions.push( suggestion );
	}

	return {
		featuredSuggestions,
		regularSuggestions,
	};
};
