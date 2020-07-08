/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DomainPickerModal from '../domain-picker-modal';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useCurrentDomainName } from '../hooks/use-current-domain';
import { LAUNCH_STORE } from '../stores';

export default function DomainPickerButton() {
	const [ isDomainModalVisible, setDomainModalVisibility ] = React.useState( false );
	const freeDomain = useCurrentDomainName();
	const { domain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	return (
		<>
			<Button
				aria-expanded={ isDomainModalVisible }
				aria-haspopup="menu"
				aria-pressed={ isDomainModalVisible }
				onClick={ () => setDomainModalVisibility( ( s ) => ! s ) }
			>
				<span className="domain-picker-button__label">{ `Domain: ${
					domain?.domain_name || freeDomain
				}` }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Button>
			{ isDomainModalVisible && (
				<DomainPickerModal onClose={ () => setDomainModalVisibility( false ) } />
			) }
		</>
	);
}
