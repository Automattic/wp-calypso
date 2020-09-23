/**
 * External dependencies
 */
import { subscribe, select } from '@wordpress/data';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE } from '../../stores/domain-suggestions';

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
