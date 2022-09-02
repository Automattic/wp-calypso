import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getUserOwnsPurchase } from 'calypso/state/purchases/selectors/get-user-owns-purchase';
import { UseItemInfoProps } from '../types';

export const useItemInfo = ( { purchase }: UseItemInfoProps ) => {
	const isNotPlanOwner = useSelector(
		( state ) => ! ( purchase !== undefined ? getUserOwnsPurchase( state, purchase.id ) : false )
	);

	return useMemo(
		() => ( {
			isNotPlanOwner,
		} ),
		[ isNotPlanOwner ]
	);
};
