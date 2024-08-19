import { Purchases } from '@automattic/data-stores';
import { MenuItem } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import React, { ComponentType } from 'react';
import { handleRenewNowClick } from 'calypso/lib/purchases'; //eslint-disable-line no-restricted-imports
import { useDispatch } from 'calypso/state'; //eslint-disable-line no-restricted-imports
import { ResponseDomain } from './types';
import type { Purchase } from 'calypso/lib/purchases/types'; //eslint-disable-line no-restricted-imports

interface MenuItemLinkProps extends Omit< React.ComponentProps< typeof MenuItem >, 'href' > {
	href?: string;
}

const MenuItemLink = MenuItem as ComponentType< MenuItemLinkProps >;

interface ManualRenewalProps {
	domain: ResponseDomain;
	onClose?: () => void;
}

const ManualRenewal: React.FC< ManualRenewalProps > = ( { domain, onClose } ) => {
	const subscriptionId = domain.subscriptionId ? parseInt( domain.subscriptionId ) : 0;
	const siteId = domain?.blogId;
	const sitePurchases = Purchases.useSitePurchases( { siteId } );
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const purchase = subscriptionId ? sitePurchases.data?.[ subscriptionId ] : null;

	const handleManualRenew = () => {
		dispatch( handleRenewNowClick( purchase as Purchase, domain.domain ) );
	};

	return (
		<MenuItemLink
			onClick={ () => {
				handleManualRenew();
				onClose?.();
			} }
		>
			{ ! domain.expired || domain.isRenewable ? __( 'Renew now' ) : __( 'Redeem now' ) }
		</MenuItemLink>
	);
};

export default ManualRenewal;
