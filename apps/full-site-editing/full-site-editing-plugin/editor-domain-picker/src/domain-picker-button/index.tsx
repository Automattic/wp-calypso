/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';
import 'a8c-fse-common-data-stores';
import { Site } from '@automattic/data-stores';
// eslint-disable-next-line no-duplicate-imports
import type { DomainSuggestions } from '@automattic/data-stores';

import DomainPickerModal from '../domain-picker-modal';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
const FLOW_ID = 'gutenboarding';

const SITES_STORE = Site.register( { client_id: '', client_secret: '' } );

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

export default function DomainPickerButton() {
	const [ isDomainModalVisible, setDomainModalVisibility ] = React.useState( false );
	const [ domainSearch, setDomainSearch ] = React.useState( '' );
	const site = useSelect( ( select ) => select( SITES_STORE ).getSite( window._currentSiteId ) );
	const [ domainName, setDomainName ] = React.useState(
		site?.URL && new URL( site?.URL ).hostname
	);

	React.useEffect( () => {
		setDomainName( ( site?.URL && new URL( site?.URL ).hostname ) || '' );
	}, [ site ] );

	const search = ( domainSearch.trim() || site?.name ) ?? '';

	const handleDomainSelect = ( domain?: DomainSuggestions.DomainSuggestion ) => {
		// TODO: store whole domain suggestion object here because it has product_id and other useful info
		// that we need for the cart
		setDomainName( domain?.domain_name );
		setDomainModalVisibility( false );
	};

	return (
		<>
			<Button
				aria-expanded={ isDomainModalVisible }
				aria-haspopup="menu"
				aria-pressed={ isDomainModalVisible }
				onClick={ () => setDomainModalVisibility( ( s ) => ! s ) }
			>
				<span className="domain-picker-button__label">{ `Domain: ${ domainName ?? '' }` }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Button>
			<DomainPickerModal
				analyticsFlowId={ FLOW_ID }
				analyticsUiAlgo="editor_domain_modal"
				initialDomainSearch={ search }
				onSetDomainSearch={ setDomainSearch }
				isOpen={ isDomainModalVisible }
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				currentDomain={ domainName }
				onDomainSelect={ handleDomainSelect }
				onClose={ () => setDomainModalVisibility( false ) }
			/>
		</>
	);
}
