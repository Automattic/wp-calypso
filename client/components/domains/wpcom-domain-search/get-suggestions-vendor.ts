import {
	NEWSLETTER_FLOW,
	isDomainForGravatarFlow,
	isHundredYearPlanFlow,
	isHundredYearDomainFlow,
} from '@automattic/onboarding';

/**
 * Get the suggestions vendor
 * @param {Object} [options={}] Options to determine the suggestion vendor
 * @param {boolean} [options.isSignup=false] Flag to indicate that we're in a signup context
 * @param {boolean} [options.isDomainOnly=false] Flag to indicate that we're in a domain-only context
 * @param {boolean} [options.isPremium=false] Flag to show premium domains.
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
interface DomainSuggestionsVendorOptions {
	isSignup?: boolean;
	isDomainOnly?: boolean;
	isPremium?: boolean;
	flowName?: string;
}
type DomainSuggestionsVendor =
	| 'variation2_front'
	| 'variation4_front'
	| 'variation8_front'
	| 'newsletter'
	| 'ecommerce'
	| 'gravatar'
	| '100-year-domains';

export function getDomainSuggestionsVendor( {
	isPremium = true,
	...options
}: DomainSuggestionsVendorOptions = {} ): DomainSuggestionsVendor {
	if ( isDomainForGravatarFlow( options.flowName ) ) {
		return 'gravatar';
	}
	if ( isHundredYearPlanFlow( options.flowName ) || isHundredYearDomainFlow( options.flowName ) ) {
		return '100-year-domains';
	}
	if ( options.flowName === 'domains/add' ) {
		return 'variation8_front';
	}
	if ( options.flowName === NEWSLETTER_FLOW ) {
		return 'newsletter';
	}
	if ( options.isSignup && ! options.isDomainOnly ) {
		return 'variation4_front';
	}
	if ( isPremium ) {
		return 'variation8_front';
	}
	return 'variation2_front';
}
