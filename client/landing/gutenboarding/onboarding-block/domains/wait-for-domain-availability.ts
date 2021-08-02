import { subscribe, select } from '@wordpress/data';
import { DOMAIN_SUGGESTIONS_STORE } from '../../stores/domain-suggestions';
import type { DomainSuggestions } from '@automattic/data-stores';

type DomainAvailability = DomainSuggestions.DomainAvailability;

export default function waitForDomainAvailability( domain: string ): Promise< DomainAvailability > {
	let unsubscribe: () => void = () => undefined;
	return new Promise< DomainAvailability >( ( resolve ) => {
		unsubscribe = subscribe( () => {
			const domainAvailability = select( DOMAIN_SUGGESTIONS_STORE ).isAvailable( domain );
			if ( domainAvailability ) {
				resolve( domainAvailability );
			}
		} );

		const alreadyResolved = select( DOMAIN_SUGGESTIONS_STORE ).isAvailable( domain );

		if ( alreadyResolved ) {
			resolve( alreadyResolved );
		}
	} ).finally( unsubscribe );
}
