import { isDomainMoveInternal } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { useDomainSearch } from '../page/context';
import type { DomainSuggestion } from '@automattic/api-core';

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
	forceRegularPrice?: boolean;
	freeForFirstYear?: boolean;
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

	if ( suggestion.is_premium || priceRules.forceRegularPrice ) {
		return DomainPriceRule.PRICE;
	}

	if ( priceRules.freeForFirstYear ) {
		return DomainPriceRule.FREE_FOR_FIRST_YEAR;
	}

	return DomainPriceRule.PRICE;
};

export const useSuggestion = ( domainName: string ) => {
	const { query, queries, config } = useDomainSearch();

	const { data: suggestion } = useQuery( {
		...queries.domainSuggestions( query ),
		select: ( data ) => {
			const suggestion = data.find( ( suggestion ) => suggestion.domain_name === domainName );

			if ( ! suggestion ) {
				throw new Error( `Suggestion not found for domain: ${ domainName }` );
			}

			return {
				...suggestion,
				price_rule: getPriceRuleForSuggestion( { suggestion, priceRules: config.priceRules } ),
			};
		},
	} );

	if ( ! suggestion ) {
		throw new Error( `Suggestion not found for domain: ${ domainName }` );
	}

	return suggestion;
};
