import { DomainSuggestion } from '@automattic/data-stores';
import { MinimalRequestCartProduct, ResponseCartProduct } from '@automattic/shopping-cart';

export interface DomainStepResult {
	stepName?: 'domains';
	suggestion?: DomainSuggestion;
	shouldHideFreePlan?: boolean;
	signupDomainOrigin?: string;
	siteUrl?: string;
	lastDomainSearched?: string;
	domainCart?: ResponseCartProduct[] | object;
	shouldSkipSubmitTracking?: boolean;
	domainItem?: DomainSuggestion;
}
export interface PlansStepResult {
	stepName: 'plans';
	cartItems: MinimalRequestCartProduct[] | null;
}
