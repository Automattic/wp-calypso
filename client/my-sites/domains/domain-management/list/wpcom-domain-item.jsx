/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Badge from 'calypso/components/badge';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import PopoverMenu from 'calypso/components/popover/menu';
import Gridicon from 'calypso/components/gridicon';
import { domainManagementChangeSiteAddress } from 'calypso/my-sites/domains/paths';

/**
 * Style dependencies
 */
import './wpcom-domain-item.scss';
import { createInterpolateElement } from '@wordpress/element';

export default function WpcomDomainItem( {
	currentRoute,
	domain,
	disabled,
	isBusy,
	onMakePrimary,
	site,
} ) {
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
			<span className="wpcom-domain-item__description">
				{ createInterpolateElement(
					sprintf(
						/* translators: %s - The WordPress.com subdomain. (ex.: subdomain.wordpress.com) */
						__( 'Your free WordPress.com address is <strong>%s</strong>' ),
						domain.domain
					),
					{ strong: React.createElement( 'strong', null ) }
				) }
			</span>
			{ domain.isPrimary && (
				<Badge className="wpcom-domain-item__primary-badge" type="info-green">
					{ __( 'Primary site address' ) }
				</Badge>
			) }
			<Button
				className="wpcom-domain-item__manage-button"
				compact
				ref={ buttonRef }
				onClick={ handleToggleMenu }
				disabled={ disabled }
				busy={ isBusy }
			>
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
	disabled: PropTypes.bool,
	isBusy: PropTypes.bool,
	onMakePrimary: PropTypes.func,
	site: PropTypes.object,
};
