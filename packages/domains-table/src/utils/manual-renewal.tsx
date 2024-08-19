import { Purchases } from '@automattic/data-stores';
import { MenuItem } from '@wordpress/components';
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
	label: string;
}

const ManualRenewal: React.FC< ManualRenewalProps > = ( { domain, onClose, label } ) => {
	const subscriptionId = domain.subscriptionId ? parseInt( domain.subscriptionId ) : 0;
	const siteId = domain?.blogId;
	const sitePurchases = Purchases.useSitePurchases( { siteId } );
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
			{ label }
		</MenuItemLink>
	);
};

export default ManualRenewal;
