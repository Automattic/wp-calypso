/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';

export function useDomainSelection() {
	const { plan } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { setDomain, unsetDomain, unsetPlan, confirmDomainSelection } = useDispatch( LAUNCH_STORE );
	const { domain: selectedDomain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	function onDomainSelect( suggestion: DomainSuggestions.DomainSuggestion ) {
		confirmDomainSelection();
		setDomain( suggestion );
		if ( plan?.isFree ) {
			unsetPlan();
		}
	}

	function onExistingSubdomainSelect() {
		unsetDomain();
	}

	return {
		onDomainSelect,
		onExistingSubdomainSelect,
		selectedDomain,
	};
}
