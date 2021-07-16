/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import PopoverMenu from 'calypso/components/popover/menu';
import Gridicon from 'calypso/components/gridicon';
import { domainManagementChangeSiteAddress } from 'calypso/my-sites/domains/paths';

/**
 * Style dependencies
 */
import './wpcom-domain-item.scss';

export default function WpcomDomainItem( { currentRoute, domain, onMakePrimary, site } ) {
	const [ menuVisibility, setMenuVisibility ] = useState( false );
	const buttonRef = useRef( null );
	const canMakePrimary = domain.canSetAsPrimary && ! domain.isPrimary;
	const handleMakePrimary = ( event ) => {
		event.stopPropagation();
		onMakePrimary( domain.domain );
	};
	const handleMenuClose = () => setMenuVisibility( false );
	const handleToggleMenu = () => setMenuVisibility( ! menuVisibility );

	return (
		<div className="wpcom-domain-item">
			<span>
				{ __( 'Your free WordPress.com address is ' ) }
				<strong>{ domain.domain }</strong>
			</span>
			<Button compact ref={ buttonRef } onClick={ handleToggleMenu }>
				Manage
				<Gridicon icon="chevron-down" />
			</Button>
			<PopoverMenu
				isVisible={ menuVisibility }
				onClose={ handleMenuClose }
				context={ buttonRef.current }
				position="bottom"
			>
				{ canMakePrimary && (
					<PopoverMenuItem icon="domains" onClick={ handleMakePrimary }>
						{ __( 'Make primary domain' ) }
					</PopoverMenuItem>
				) }
				<PopoverMenuItem
					icon="reblog"
					href={ domainManagementChangeSiteAddress( site.slug, domain.domain, currentRoute ) }
				>
					{ __( 'Change site address' ) }
				</PopoverMenuItem>
			</PopoverMenu>
		</div>
	);
}

WpcomDomainItem.propTypes = {
	currentRoute: PropTypes.string,
	domain: PropTypes.object.isRequired,
	onMakePrimary: PropTypes.func,
	site: PropTypes.object,
};
