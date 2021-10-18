import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { createElement } from 'react';
import Badge from 'calypso/components/badge';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import Spinner from 'calypso/components/spinner';
import { domainManagementChangeSiteAddress } from 'calypso/my-sites/domains/paths';

import './wpcom-domain-item.scss';

export default function WpcomDomainItem( {
	currentRoute,
	domain,
	disabled,
	isBusy,
	onMakePrimary,
	site,
	isAtomicSite,
} ) {
	const canMakePrimary = domain.canSetAsPrimary && ! domain.isPrimary;
	const shouldShowManageButton = canMakePrimary || ! isAtomicSite;
	const handleMakePrimary = ( event ) => {
		event.stopPropagation();
		onMakePrimary( domain.domain );
	};

	return (
		<div className="wpcom-domain-item">
			<span className="wpcom-domain-item__description">
				{ createInterpolateElement(
					sprintf(
						/* translators: %s - The WordPress.com subdomain. (ex.: subdomain.wordpress.com) */
						__( 'Your free WordPress.com address is <strong>%s</strong>' ),
						domain.domain
					),
					{ strong: createElement( 'strong', null ) }
				) }
				{ domain.isPrimary && (
					<Badge className="wpcom-domain-item__primary-badge" type="info-green">
						{ __( 'Primary site address' ) }
					</Badge>
				) }
			</span>

			{ shouldShowManageButton && ! isBusy && (
				<EllipsisMenu
					disabled={ isBusy || disabled }
					toggleTitle={ __( 'Free WordPress address options' ) }
				>
					{ canMakePrimary && (
						<PopoverMenuItem icon="house" onClick={ handleMakePrimary }>
							{ __( 'Make primary address' ) }
						</PopoverMenuItem>
					) }
					{ ! isAtomicSite && (
						<PopoverMenuItem
							icon="pencil"
							href={ domainManagementChangeSiteAddress( site.slug, domain.domain, currentRoute ) }
						>
							{ __( 'Change site address' ) }
						</PopoverMenuItem>
					) }
				</EllipsisMenu>
			) }

			{ isBusy && <Spinner /> }
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
