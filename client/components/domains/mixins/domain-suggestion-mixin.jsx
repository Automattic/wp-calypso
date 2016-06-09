/**
 * Internal Dependencies
 **/
import cartItems from 'lib/cart-values/cart-items';

export default {
	willBundle( withPlansOnly, selectedSite, cart, suggestion ) {
		return withPlansOnly && // plansOnly active
			( suggestion.product_slug && suggestion.cost ) && // not free
			( ! cartItems.isDomainBeingUsedForPlan( cart, suggestion.domain_name ) ) && // a plan in cart
			( ! cartItems.isNextDomainFree( cart ) ) && // domain credit
			( ! cartItems.hasPlan( cart ) ) && // already a plan in cart
			( ! selectedSite || ( selectedSite && selectedSite.plan.product_slug === 'free_plan' ) ); // site has a plan
	},

	getPriceRule( withPlansOnly, selectedSite, cart, suggestion ) {
		if ( ! suggestion.product_slug || suggestion.cost === 'Free' ) {
			return 'FREE_DOMAIN';
		}

		if ( cartItems.isDomainBeingUsedForPlan( cart, suggestion.domain_name ) ) {
			return 'FREE_WITH_PLAN';
		}

		if ( cartItems.isNextDomainFree( cart ) ) {
			return 'FREE_WITH_PLAN';
		}

		if ( this.willBundle( withPlansOnly, selectedSite, cart, suggestion ) ) {
			return 'INCLUDED_IN_PREMIUM';
		}

		return 'PRICE';
	}
};
