import {
	isDomainForGravatarFlow,
	isHundredYearPlanFlow,
	isHundredYearDomainFlow,
	isNewsletterFlow,
} from '@automattic/onboarding';
import type { DomainSuggestionQueryVendor } from '@automattic/api-core';

interface DomainSuggestionsVendorOptions {
	isSignup?: boolean;
	isDomainOnly?: boolean;
	isPremium?: boolean;
	isCiab?: boolean;
	flowName?: string;
}

/**
 * Get the suggestions vendor
 * @param {Object} [options] Options to determine the suggestion vendor
 * @param {boolean} [options.isSignup] Flag to indicate that we're in a signup context
 * @param {boolean} [options.isDomainOnly] Flag to indicate that we're in a domain-only context
 * @param {boolean} [options.isPremium] Flag to show premium domains.
 * @param {boolean} [options.isCiab] Flag to indicate that we're in a Commerce in a Box context.
 * @param {string} [options.flowName] The flow name (used to determine the vender).
 * @returns {string} Vendor string to pass as part of the domain suggestions query.
 */
export const getSuggestionsVendor = ( {
	isPremium = true,
	isCiab,
	flowName,
	isSignup,
	isDomainOnly,
}: DomainSuggestionsVendorOptions = {} ): DomainSuggestionQueryVendor => {
	if ( isCiab ) {
		return 'ciab';
	}
	if ( isDomainForGravatarFlow( flowName ) ) {
		return 'gravatar';
	}
	if ( isHundredYearPlanFlow( flowName ) || isHundredYearDomainFlow( flowName ) ) {
		return '100-year-domains';
	}
	if ( flowName === 'domains/add' ) {
		return 'wpcom_suggestions_premium';
	}
	if ( isNewsletterFlow( flowName ) ) {
		return 'newsletter';
	}
	if ( isSignup && ! isDomainOnly ) {
		return 'wpcom_suggestions_standard';
	}
	if ( isPremium ) {
		return 'wpcom_suggestions_premium';
	}
	return 'variation2_front';
};
