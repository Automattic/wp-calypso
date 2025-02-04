import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import { domainAvailability } from 'calypso/lib/domains/constants';

export function isFreeTransfer( { cart, domain, availability } ) {
	return (
		( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, domain ) ) &&
		availability.status !== domainAvailability.TRANSFERRABLE_PREMIUM
	);
}
