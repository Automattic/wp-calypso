import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { type FeaturedSuggestionReason } from '../../helpers/partition-featured-suggestions';
import { useSuggestion } from '../../hooks/use-suggestion';
import { useDomainSuggestionBadges } from '../../hooks/use-suggestion-badges';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion, DomainSuggestionBadge, DomainSuggestionPrice } from '../../ui';
import { DomainSuggestionCTA } from '../suggestion-cta';

interface FeaturedSearchResultsItemProps {
	reason: FeaturedSuggestionReason;
	domainName: string;
	isSingleFeaturedSuggestion: boolean;
}

export const FeaturedSearchResultsItem = ( {
	reason,
	domainName,
	isSingleFeaturedSuggestion,
}: FeaturedSearchResultsItemProps ) => {
	const [ domain, ...tlds ] = domainName.split( '.' );
	const { queries } = useDomainSearch();

	const suggestion = useSuggestion( domainName );
	const { data: availability } = useQuery( queries.domainAvailability( domainName ) );
	const suggestionBadges = useDomainSuggestionBadges( domainName );

	const badges = useMemo( () => {
		if ( reason === 'exact-match' ) {
			return [
				<DomainSuggestionBadge key="available" variation="success">
					{ __( "It's available!" ) }
				</DomainSuggestionBadge>,
			];
		}

		const existingBadges = [ ...suggestionBadges ];

		if ( reason === 'recommended' ) {
			existingBadges.unshift(
				<DomainSuggestionBadge key="recommended">{ __( 'Recommended' ) }</DomainSuggestionBadge>
			);
		}
		if ( reason === 'best-alternative' ) {
			existingBadges.unshift(
				<DomainSuggestionBadge key="best-alternative">
					{ __( 'Best alternative' ) }
				</DomainSuggestionBadge>
			);
		}
		return existingBadges;
	}, [ reason, suggestionBadges ] );

	return (
		<DomainSuggestion.Featured
			isHighlighted={ reason === 'exact-match' }
			isSingleFeaturedSuggestion={ isSingleFeaturedSuggestion }
			badges={ badges.length > 0 ? badges : undefined }
			domain={ domain }
			tld={ tlds.join( '.' ) }
			price={
				<DomainSuggestionPrice salePrice={ availability?.sale_cost } price={ suggestion.cost } />
			}
			cta={ <DomainSuggestionCTA domainName={ domainName } /> }
		/>
	);
};
