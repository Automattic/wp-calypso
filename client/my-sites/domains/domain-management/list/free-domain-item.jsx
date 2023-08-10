/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Badge, Spinner } from '@automattic/components';
import { createInterpolateElement, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, edit, home } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { createElement } from 'react';
import SiteAddressChanger from 'calypso/blocks/site-address-changer';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

import './free-domain-item.scss';

export default function FreeDomainItem( {
	domain,
	disabled,
	isBusy,
	onMakePrimary,
	isAtomicSite,
} ) {
	const canMakePrimary = domain.canSetAsPrimary && ! domain.isPrimary;
	const shouldShowManageButton = canMakePrimary || ! isAtomicSite;
	const handleMakePrimary = ( event ) => {
		event.stopPropagation();
		onMakePrimary( domain.domain );
	};
	const [ isDialogVisible, setDialogVisible ] = useState( false );

	const renderSiteAddressChanger = () => {
		const domainName = domain?.name ?? '';
		const currentDomainSuffix = domainName.match( /\.\w+\.\w+$/ )[ 0 ];

		return (
			<SiteAddressChanger
				currentDomain={ domain }
				currentDomainSuffix={ currentDomainSuffix }
				isDialogVisible={ isDialogVisible }
				onClose={ () => setDialogVisible( false ) }
			/>
		);
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
						<Icon icon={ home } size={ 14 } />
						{ __( 'Primary site address' ) }
					</Badge>
				) }
			</span>

			{ shouldShowManageButton && ! isBusy && (
				<EllipsisMenu
					disabled={ disabled }
					toggleTitle={ __( 'Free WordPress address options' ) }
					popoverClassName="free-domain-item__popover"
					position="bottom"
				>
					{ canMakePrimary && (
						<PopoverMenuItem onClick={ handleMakePrimary }>
							<Icon icon={ home } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
							{ __( 'Make primary site address' ) }
						</PopoverMenuItem>
					) }
					{ ! isAtomicSite && (
						<PopoverMenuItem onClick={ () => setDialogVisible( true ) }>
							<Icon icon={ edit } size={ 18 } className="gridicon" viewBox="2 2 20 20" />
							{ __( 'Change site address' ) }
						</PopoverMenuItem>
					) }
				</EllipsisMenu>
			) }

			{ renderSiteAddressChanger() }

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
