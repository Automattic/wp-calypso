import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';

export function isFreeTransfer( { cart, domain } ) {
	return isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, domain );
}
