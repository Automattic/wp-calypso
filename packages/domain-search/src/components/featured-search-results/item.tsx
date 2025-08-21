import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { type FeaturedSuggestionReason } from '../../helpers/partition-suggestions';
import { useDomainSuggestionBadges } from '../../hooks/use-suggestion-badges';
import { DomainSuggestion, DomainSuggestionBadge } from '../../ui';
import { DomainSuggestionCTA } from '../suggestion-cta';
import { DomainSuggestionPrice } from '../suggestion-price';

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
			price={ <DomainSuggestionPrice domainName={ domainName } /> }
			cta={ <DomainSuggestionCTA domainName={ domainName } /> }
		/>
	);
};
