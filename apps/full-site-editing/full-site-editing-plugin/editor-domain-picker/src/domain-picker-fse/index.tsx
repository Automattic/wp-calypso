/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import DomainPicker from '@automattic/domain-picker';
import type { DomainSuggestions } from '@automattic/data-stores';
import { recordTracksEvent } from '@automattic/calypso-analytics';

/**
 * Internal dependencies
 */
import { useSite, useCurrentDomainName } from '../hooks/use-current-domain';
import { LAUNCH_STORE } from '../stores';

const FLOW_ID = 'gutenboarding';

interface Props {
	onSelect?: () => void;
}

const DomainPickerFSE: React.FunctionComponent< Props > = ( { onSelect } ) => {
	const site = useSite();

	// TODO: add a new prop on domain Picker to display this value in a disabled state
	const freeDomain = useCurrentDomainName();

	const { domain, domainSearch } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { setDomain, unsetDomain, setDomainSearch } = useDispatch( LAUNCH_STORE );

	const search = ( domainSearch.trim() || site?.name ) ?? '';

	const handleDomainSelect = ( suggestion: DomainSuggestions.DomainSuggestion ) => {
		setDomain( suggestion );
		onSelect?.();
	};

	const handleExistingSubdomainSelect = () => {
		unsetDomain();
	};

	const trackDomainSearchInteraction = ( query: string ) => {
		recordTracksEvent( 'calypso_newsite_domain_search_blur', {
			flow: FLOW_ID,
			query,
			where: 'editor_domain_modal',
		} );
	};

	return (
		<DomainPicker
			analyticsFlowId={ FLOW_ID }
			initialDomainSearch={ search }
			onSetDomainSearch={ setDomainSearch }
			onDomainSearchBlur={ trackDomainSearchInteraction }
			currentDomain={ domain?.domain_name || freeDomain }
			existingSubdomain={ freeDomain }
			onDomainSelect={ handleDomainSelect }
			onExistingSubdomainSelect={ handleExistingSubdomainSelect }
			analyticsUiAlgo="editor_domain_modal"
			segregateFreeAndPaid
		/>
	);
};

export default DomainPickerFSE;
