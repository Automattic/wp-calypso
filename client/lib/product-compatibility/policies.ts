export const NO_CONFLICTS_FOUND = 1;
export const DENY_PURCHASE_SUPERSEDING_PLAN = 2;
export const PARTIALLY_REDUNDANT_PLAN_PURCHASE = 3;

const productConcurrencyPolicies = [
	{
		id: DENY_PURCHASE_SUPERSEDING_PLAN,
		description:
			'You are attempting to purchase a product that is contained in a plan already attached to the site.',
		rules: [ 'deny-purchase', 'explain-reason' ],
	},
	{
		id: PARTIALLY_REDUNDANT_PLAN_PURCHASE,
		description:
			'You are attempting to purchase a plan that contains {$product}, which you already own.',
		rules: [ 'allow-purchase', 'explain-prior-to-purchase' ],
	},
	{
		id: NO_CONFLICTS_FOUND,
		description: 'The selected product arrangement has no known conflicts.',
		rules: [ 'allow-purchase' ],
	},
];

export function getPolicyById( id: number ): object | boolean {
	for ( let i = 0; i < productConcurrencyPolicies.length; i++ ) {
		const thisPolicy = productConcurrencyPolicies[ i ];
		if ( thisPolicy.id === id ) {
			return thisPolicy;
		}
	}

	return false;
}

export default productConcurrencyPolicies;
