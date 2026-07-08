import { useEvent } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo } from 'react';
import { parseMatchReasons } from '../../helpers';
import { type FeaturedSuggestionReason } from '../../helpers/partition-suggestions';
import { usePolicyBadges } from '../../hooks/use-policy-badges';
import { DomainPriceRule, useSuggestion } from '../../hooks/use-suggestion';
import { useDomainSuggestionBadges } from '../../hooks/use-suggestion-badges';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion, DomainSuggestionBadge } from '../../ui';
import { bullseyeIcon } from '../../ui/icons/bullseye-icon';
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

	const showsExactMatchBadge =
		reason === 'exact-match' && suggestion.price_rule !== DomainPriceRule.DOMAIN_MOVE_PRICE;

	const matchReasons = useMemo( () => {
		if ( ! suggestion.match_reasons || query !== domainName ) {
			return;
		}

		// The exact-match badge already surfaces "Exact match", so drop the redundant
		// 'exact-match' footer reason to avoid rendering the same label twice on the
		// card (the backend sends it for an available FQDN search). The remaining
		// per-TLD reasons still render.
		const reasons = showsExactMatchBadge
			? suggestion.match_reasons.filter( ( matchReason ) => matchReason !== 'exact-match' )
			: suggestion.match_reasons;

		const parsed = parseMatchReasons( domainName, reasons );

		return parsed.length > 0 ? parsed : undefined;
	}, [ domainName, suggestion.match_reasons, query, showsExactMatchBadge ] );

	const suggestionBadges = useDomainSuggestionBadges( domainName );
	const policyBadges = usePolicyBadges( domainName );

	const badges = useMemo( () => {
		if ( showsExactMatchBadge ) {
			return [
				<DomainSuggestionBadge key="exact-match">
					{ bullseyeIcon }
					{ __( 'Exact match' ) }
				</DomainSuggestionBadge>,
				<DomainSuggestionBadge key="available" variation="success">
					{ __( "It's available!" ) }
				</DomainSuggestionBadge>,
				...suggestionBadges, // we still want to show the premium and sale badges even when it's an exact match
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
	}, [ reason, suggestionBadges, policyBadges, showsExactMatchBadge ] );

	const { events } = useDomainSearch();

	const triggerSuggestionRenderEvent = useEvent( () => {
		events.onSuggestionRender( suggestion, reason );
	} );

	useEffect( () => {
		triggerSuggestionRenderEvent();
	}, [ triggerSuggestionRenderEvent ] );

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
