import { AddOns } from '@automattic/data-stores';
import { useSelector } from 'react-redux';
import { isPartnerPurchase } from 'calypso/lib/purchases';
import { getSelectedPurchase } from 'calypso/state/ui/selectors';

export const useStorageAddOnAvailable = ( siteId?: number | null ) => {
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId } );
	const planPurchase = useSelector( getSelectedPurchase );
	const isAgencyPurchase = planPurchase && isPartnerPurchase( planPurchase );

	return availableStorageAddOns.length && ! isAgencyPurchase;
};
