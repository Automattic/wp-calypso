import { useCallback, useEffect, useState } from 'react';
import { useCursorPagination } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import { useDispatch } from 'calypso/state';

type Props = {
	storedCards: PaymentMethod[];
	enabled: boolean;
	hasMoreStoredCards: boolean;
};

/**
 * Prepares the paging cursor for use in pagination.
 * @param direction - The direction of the page change.
 * @param items - The items to paginate.
 * @param isFirstPage - Whether the current page is the first page.
 * @returns The paging cursor.
 */
const preparePagingCursor = (
	direction: 'next' | 'prev',
	items: PaymentMethod[],
	isFirstPage: boolean
) => {
	if ( ! items.length || isFirstPage ) {
		return {
			startingAfter: '',
			endingBefore: '',
		};
	}

	return {
		startingAfter: direction === 'next' ? items[ items.length - 1 ].id : '',
		endingBefore: direction === 'prev' ? items[ 0 ].id : '',
	};
};

export default function useStoredCardsPagination( {
	storedCards,
	enabled,
	hasMoreStoredCards,
}: Props ) {
	const dispatch = useDispatch();

	const [ paging, setPaging ] = useState( { startingAfter: '', endingBefore: '' } );

	const onPageClickCallback = useCallback(
		( page: number, direction: 'next' | 'prev' ) => {
			// Set a cursor for use in pagination.
			setPaging( preparePagingCursor( direction, storedCards, page === 1 ) );
		},
		[ storedCards, setPaging ]
	);

	const [ page, showPagination, onPageClick ] = useCursorPagination(
		enabled,
		hasMoreStoredCards,
		onPageClickCallback
	);

	useEffect( () => {
		// FIXME: Dispatch an action to fetch the next page of stored cards.
	}, [ dispatch, paging ] );

	return {
		page,
		showPagination,
		onPageClick,
	};
}
