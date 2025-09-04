import { isDomainMoveInternal } from '@automattic/calypso-products';
import { DomainPriceRule } from '@automattic/domain-search';
import {
	isDomainForGravatarFlow,
	isDomainUpsellFlow,
	isHundredYearDomainFlow,
	isHundredYearPlanFlow,
} from '@automattic/onboarding';
import { isMonthlyOrFreeFlow, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import type { DomainSuggestion } from '@automattic/api-core';
import type { ResponseCart } from '@automattic/shopping-cart';

export const getPriceRuleForSuggestion = ( {
	suggestion,
	flowName,
	responseCart,
}: {
	suggestion: DomainSuggestion;
	flowName: string;
	responseCart: ResponseCart;
} ) => {
	if ( isHundredYearPlanFlow( flowName ) ) {
		return DomainPriceRule.HIDE_PRICE;
	}

	if ( isHundredYearDomainFlow( flowName ) ) {
		return DomainPriceRule.ONE_TIME_PRICE;
	}

	if ( suggestion?.is_premium ) {
		return DomainPriceRule.PRICE;
	}

	if ( isDomainMoveInternal( suggestion ) ) {
		return DomainPriceRule.DOMAIN_MOVE_PRICE;
	}

	if ( isMonthlyOrFreeFlow( flowName ) ) {
		return DomainPriceRule.PRICE;
	}

	if ( isDomainForGravatarFlow( flowName ) ) {
		return suggestion.sale_cost === 0 ? DomainPriceRule.FREE_FOR_FIRST_YEAR : DomainPriceRule.PRICE;
	}

	// TODO: Migrate domainAndPlanUpsellFlow to domain upsell
	if ( isDomainUpsellFlow( flowName ) ) {
		return DomainPriceRule.FREE_FOR_FIRST_YEAR;
	}

	if ( isNextDomainFree( responseCart, suggestion.domain_name ) ) {
		return DomainPriceRule.FREE_FOR_FIRST_YEAR;
	}

	return DomainPriceRule.PRICE;
};
