import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { isUserPurchaseOwner } from './is-user-purchase-owner';
import type { Purchase } from 'calypso/lib/purchases/types';

const DEFAULT_OPTIONS = {
	fallbackToCurrentUser: true,
};

export const useIsUserPurchaseOwner = (
	userId?: number | null,
	options?: typeof DEFAULT_OPTIONS
) => {
	const currentUserId = useSelector( getCurrentUserId );

	const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

	const userIdToUse = ! userId && mergedOptions.fallbackToCurrentUser ? currentUserId : userId;

	return useCallback(
		( purchase?: Purchase ) => isUserPurchaseOwner( userIdToUse )( purchase ),
		[ userIdToUse ]
	);
};
