import { DomainAvailabilityStatus } from '@automattic/api-core';
import { isDomainMoveInternal } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { addAvailabilityAsSuggestion } from '../helpers/add-availability-as-suggestion';
import { isSupportedPremiumDomain } from '../helpers/is-supported-premium-domain';
import { useDomainSearch } from '../page/context';
import type { AvailabilityAtRender } from '../page/types';
import type { DomainAvailability, DomainSuggestion } from '@automattic/api-core';

export enum DomainPriceRule {
	ONE_TIME_PRICE = 'ONE_TIME_PRICE',
	HIDE_PRICE = 'HIDE_PRICE',
	FREE_FOR_FIRST_YEAR = 'FREE_FOR_FIRST_YEAR',
	PRICE = 'PRICE',
	DOMAIN_MOVE_PRICE = 'DOMAIN_MOVE_PRICE',
}

export interface PriceRulesConfig {
	hidePrice?: boolean;
	oneTimePrice?: boolean;
	freeForFirstYear?: boolean;
	/**
	 * List of specific domain names that should always show $0 pricing (free for first year),
	 * regardless of the global freeForFirstYear flag. Used to keep a domain showing as $0 in
	 * the suggestion list after it has been added to the cart with a free-domain promotion.
	 */
	freeForFirstYearDomains?: string[];
	/**
	 * When set, only domains whose TLD is in this list get FREE_FOR_FIRST_YEAR pricing.
	 * All other TLDs show their real price. Takes precedence over freeForFirstYear.
	 */
	freeForFirstYearTlds?: string[];
}

const getPriceRuleForSuggestion = ( {
	suggestion,
	priceRules,
}: {
	suggestion: DomainSuggestion;
	priceRules: PriceRulesConfig;
} ) => {
	if ( priceRules.hidePrice ) {
		return DomainPriceRule.HIDE_PRICE;
	}

	if ( priceRules.oneTimePrice ) {
		return DomainPriceRule.ONE_TIME_PRICE;
	}

	if ( isDomainMoveInternal( suggestion ) ) {
		return DomainPriceRule.DOMAIN_MOVE_PRICE;
	}

	if ( suggestion.is_premium ) {
		return DomainPriceRule.PRICE;
	}

	if ( priceRules.freeForFirstYearDomains?.includes( suggestion.domain_name ) ) {
		return DomainPriceRule.FREE_FOR_FIRST_YEAR;
	}

	if ( priceRules.freeForFirstYearTlds ) {
		return priceRules.freeForFirstYearTlds.some( ( tld ) =>
			suggestion.domain_name.endsWith( '.' + tld )
		)
			? DomainPriceRule.FREE_FOR_FIRST_YEAR
			: DomainPriceRule.PRICE;
	}

	if ( priceRules.freeForFirstYear ) {
		return DomainPriceRule.FREE_FOR_FIRST_YEAR;
	}

	return DomainPriceRule.PRICE;
};

const getAvailabilityAtRender = ( availability?: DomainAvailability ): AvailabilityAtRender => {
	if ( ! availability ) {
		return 'unknown';
	}

	return availability.status === DomainAvailabilityStatus.AVAILABLE ||
		isSupportedPremiumDomain( availability )
		? 'available'
		: 'unavailable';
};

export const useSuggestion = ( domainName: string ) => {
	const { query, queries, config, events, searchId } = useDomainSearch();

	const { data: fqdnAvailability } = useQuery( {
		...queries.domainAvailability( domainName ),
	} );

	const { data: suggestions } = useQuery( {
		...queries.domainSuggestions( query ),
	} );

	if ( suggestions && fqdnAvailability ) {
		addAvailabilityAsSuggestion( suggestions, fqdnAvailability );
	}

	if ( suggestions ) {
		const suggestionPosition = suggestions.findIndex(
			( suggestion ) => suggestion.domain_name === domainName
		);

		if ( suggestionPosition === -1 ) {
			events.onSuggestionNotFound( domainName );
			throw new Error( `Suggestion not found for domain: ${ domainName }` );
		}

		const suggestion = suggestions[ suggestionPosition ];

		return {
			...suggestion,
			position: suggestionPosition,
			price_rule: getPriceRuleForSuggestion( { suggestion, priceRules: config.priceRules } ),
			// Derived from the response id and position so the same card always
			// carries the same railcar on render and on interact.
			railcar: `domain-suggestion-${
				suggestion.result_set_id ?? searchId
			}-${ suggestionPosition }`,
			availability_at_render: getAvailabilityAtRender( fqdnAvailability ),
		};
	}

	throw new Error( `Suggestion not found for domain: ${ domainName }` );
};
