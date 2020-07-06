/**
 * External dependencies
 */
import * as React from 'react';
import 'a8c-fse-common-data-stores';

/**
 * Internal dependencies
 */
import DomainPickerModal from '../domain-picker-modal';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useCurrentDomain } from '../hooks/use-current-domain';

export default function DomainPickerButton() {
	const [ isDomainModalVisible, setDomainModalVisibility ] = React.useState( false );

	const currentDomain = useCurrentDomain();

	return (
		<>
			<Button
				aria-expanded={ isDomainModalVisible }
				aria-haspopup="menu"
				aria-pressed={ isDomainModalVisible }
				onClick={ () => setDomainModalVisibility( ( s ) => ! s ) }
			>
				<span className="domain-picker-button__label">{ `Domain: ${ currentDomain.domain_name }` }</span>
				<Icon icon={ chevronDown } size={ 22 } />
			</Button>
			{ isDomainModalVisible && (
				<DomainPickerModal onClose={ () => setDomainModalVisibility( false ) } />
			) }
		</>
	);
}
