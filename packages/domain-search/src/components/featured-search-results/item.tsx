import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { parseMatchReasons } from '../../helpers';
import { type FeaturedSuggestionReason } from '../../helpers/partition-suggestions';
import { usePolicyBadges } from '../../hooks/use-policy-badges';
import { DomainPriceRule, useSuggestion } from '../../hooks/use-suggestion';
import { useDomainSuggestionBadges } from '../../hooks/use-suggestion-badges';
import { useDomainSearch } from '../../page/context';
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
	const { query } = useDomainSearch();
	const [ domain, ...tlds ] = domainName.split( '.' );

	const suggestion = useSuggestion( domainName );

	const matchReasons = useMemo( () => {
		if ( ! suggestion.match_reasons || query !== domainName ) {
			return;
		}

		return parseMatchReasons( domainName, suggestion.match_reasons );
	}, [ domainName, suggestion.match_reasons, query ] );

	const suggestionBadges = useDomainSuggestionBadges( domainName );
	const policyBadges = usePolicyBadges( domainName );

	const badges = useMemo( () => {
		if ( reason === 'exact-match' && suggestion.price_rule !== DomainPriceRule.DOMAIN_MOVE_PRICE ) {
			return [
				<DomainSuggestionBadge key="available" variation="success">
					{ __( "It's available!" ) }
				</DomainSuggestionBadge>,
				...policyBadges,
			];
		}

		const existingBadges = [ ...suggestionBadges, ...policyBadges ];

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
	}, [ reason, suggestionBadges, policyBadges, suggestion.price_rule ] );

	return (
		<DomainSuggestion.Featured
			isHighlighted={ reason === 'exact-match' }
			isSingleFeaturedSuggestion={ isSingleFeaturedSuggestion }
			matchReasons={ matchReasons }
			badges={ badges.length > 0 ? badges : undefined }
			domain={ domain }
			tld={ tlds.join( '.' ) }
			price={ <DomainSuggestionPrice domainName={ domainName } /> }
			cta={ <DomainSuggestionCTA domainName={ domainName } /> }
		/>
	);
};
