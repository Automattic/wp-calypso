/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import type { DomainSuggestions } from '@automattic/data-stores';
import { mockDomainSuggestion } from '@automattic/domain-picker';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';
import { useSiteDomains } from './use-site-domains';

export function useDomainSelection() {
	const { setDomain, unsetDomain, unsetPlan, confirmDomainSelection } = useDispatch( LAUNCH_STORE );
	const { domain: selectedDomain, plan, confirmedDomainSelection } = useSelect( ( select ) =>
		select( LAUNCH_STORE ).getState()
	);
	const { siteSubdomain } = useSiteDomains();

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
		currentDomain:
			selectedDomain || confirmedDomainSelection
				? mockDomainSuggestion( siteSubdomain?.domain )
				: undefined,
	};
}
