/**
 * External dependencies
 */
import * as React from 'react';
import 'a8c-fse-common-data-stores';
import { useSite } from '../../../editor-domain-picker/src/hooks/use-current-domain';
import { Cart } from '@automattic/wpcom-hooks';

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

	const site = useSite();

	const [ cart ] = Cart.useSiteCart?.( site?.ID );

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
			Cart products count: { cart?.products.length }
			{ isDomainModalVisible && (
				<DomainPickerModal onClose={ () => setDomainModalVisibility( false ) } />
			) }
		</>
	);
}
