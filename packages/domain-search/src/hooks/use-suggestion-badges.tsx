import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { type ReactNode, useMemo } from 'react';
import { useDomainSearch } from '../page/context';
import { DomainSuggestionBadge } from '../ui';
import { useSuggestion } from './use-suggestion';

export const useDomainSuggestionBadges = ( domainName: string ) => {
	const suggestion = useSuggestion( domainName );
	const { queries } = useDomainSearch();

	const { data: availability } = useQuery( queries.domainAvailability( domainName ) );

	const badges = useMemo( () => {
		const computedBadges: ReactNode[] = [];

		if ( suggestion.is_paid_domain && availability?.sale_cost ) {
			computedBadges.push(
				<DomainSuggestionBadge key="sale" variation="warning">
					{ __( 'Sale' ) }
				</DomainSuggestionBadge>
			);
		}

		if ( suggestion.is_premium ) {
			if ( availability?.is_price_limit_exceeded ) {
				computedBadges.push(
					<DomainSuggestionBadge
						key="restricted-premium"
						popover={ __(
							"This premium domain is currently not available at WordPress.com. Please contact support if you're interested in this domain."
						) }
					>
						{ __( 'Restricted premium' ) }
					</DomainSuggestionBadge>
				);
			} else {
				computedBadges.push(
					<DomainSuggestionBadge
						key="premium"
						popover={ __(
							'Premium domain names are usually short, easy to remember, contain popular keywords, or some combination of these factors. Premium domain names are not eligible for purchase using the free plan domain credit.'
						) }
					>
						{ __( 'Premium' ) }
					</DomainSuggestionBadge>
				);
			}
		}

		return computedBadges;
	}, [ suggestion, availability ] );

	return badges;
};
