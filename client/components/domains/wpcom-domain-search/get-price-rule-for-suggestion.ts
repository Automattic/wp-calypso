import { isDomainMoveInternal } from '@automattic/calypso-products';
import { DomainPriceRule } from '@automattic/domain-search';
import {
	isDomainForGravatarFlow,
	isDomainUpsellFlow,
	isHundredYearDomainFlow,
	isHundredYearPlanFlow,
} from '@automattic/onboarding';
import {
	isDomainBeingUsedForPlan,
	isMonthlyOrFreeFlow,
	isNextDomainFree,
} from 'calypso/lib/cart-values/cart-items';
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
		return DomainPriceRule.NO_PRICE;
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
		return DomainPriceRule.FREE_WITH_PLAN;
	}

	if ( isDomainBeingUsedForPlan( responseCart, suggestion.domain_name ) ) {
		return DomainPriceRule.FREE_WITH_PLAN;
	}

	if ( isNextDomainFree( responseCart, suggestion.domain_name ) ) {
		return DomainPriceRule.FREE_WITH_PLAN;
	}

	return DomainPriceRule.PRICE;
};
