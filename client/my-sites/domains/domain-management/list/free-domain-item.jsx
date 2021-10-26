import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, edit, home, moreVertical } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { createElement } from 'react';
import Badge from 'calypso/components/badge';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import Spinner from 'calypso/components/spinner';
import { domainManagementChangeSiteAddress } from 'calypso/my-sites/domains/paths';

import './free-domain-item.scss';

export default function FreeDomainItem( {
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
		<div className="free-domain-item">
			<span className="free-domain-item__description">
				{ createInterpolateElement(
					sprintf(
						/* translators: %s - The WordPress.com subdomain. (ex.: subdomain.wordpress.com) */
						__( 'Your free WordPress.com address is <strong>%s</strong>' ),
						domain.domain
					),
					{ strong: createElement( 'strong', null ) }
				) }
				{ domain.isPrimary && (
					<Badge className="free-domain-item__primary-badge" type="info-green">
						<Icon icon={ home } size={ 14 } /> { __( 'Primary site address' ) }
					</Badge>
				) }
			</span>

			{ shouldShowManageButton && ! isBusy && (
				<EllipsisMenu
					disabled={ isBusy || disabled }
					toggleTitle={ __( 'Free WordPress address options' ) }
					icon={ <Icon icon={ moreVertical } size={ 28 } /> }
				>
					{ canMakePrimary && (
						<PopoverMenuItem onClick={ handleMakePrimary }>
							{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
							<Icon icon={ home } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
							{ /* eslint-enable wpcalypso/jsx-classname-namespace */ }
							{ __( 'Make primary site address' ) }
						</PopoverMenuItem>
					) }
					{ ! isAtomicSite && (
						<PopoverMenuItem
							href={ domainManagementChangeSiteAddress( site.slug, domain.domain, currentRoute ) }
						>
							{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
							<Icon icon={ edit } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
							{ /* eslint-enable wpcalypso/jsx-classname-namespace */ }
							{ __( 'Change site address' ) }
						</PopoverMenuItem>
					) }
				</EllipsisMenu>
			) }

			{ isBusy && <Spinner /> }
		</div>
	);
}

FreeDomainItem.propTypes = {
	currentRoute: PropTypes.string,
	domain: PropTypes.object.isRequired,
	disabled: PropTypes.bool,
	isBusy: PropTypes.bool,
	onMakePrimary: PropTypes.func,
	site: PropTypes.object,
};
