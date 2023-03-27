import { useCallback, useReducer } from 'react';

interface PaginationState {
	currentPageIndex: number;
	prevScrollIdStack: ( string | undefined )[];
	currentScrollId: string | undefined;
	nextScrollId: string | undefined | null;
}

const defaultPaginationState: PaginationState = {
	currentPageIndex: 0,
	prevScrollIdStack: [],
	currentScrollId: undefined,
	nextScrollId: undefined,
};

type PaginationAction =
	| { type: 'click'; newPageIndex: number }
	| { type: 'load'; nextScrollId: string | null }
	| { type: 'reset' };

function paginationReducer(
	state: PaginationState = defaultPaginationState,
	action: PaginationAction
) {
	const { currentPageIndex, prevScrollIdStack, currentScrollId, nextScrollId } = state;

	switch ( action.type ) {
		case 'reset':
			return defaultPaginationState;

		case 'load':
			return {
				...state,
				nextScrollId: action.nextScrollId,
			};

		case 'click':
			if ( action.newPageIndex < currentPageIndex && prevScrollIdStack.length > 0 ) {
				return {
					currentPageIndex: currentPageIndex - 1,
					prevScrollIdStack: prevScrollIdStack.slice( 0, -1 ),
					currentScrollId: prevScrollIdStack[ prevScrollIdStack.length - 1 ],
					nextScrollId: currentScrollId,
				};
			} else if ( action.newPageIndex > state.currentPageIndex && nextScrollId ) {
				return {
					currentPageIndex: currentPageIndex + 1,
					prevScrollIdStack: [ ...prevScrollIdStack, currentScrollId ],
					currentScrollId: nextScrollId,
					nextScrollId: undefined, // We don't know the next scroll ID until we've finished loading the next page
				};
			}
			return state;
	}
}

export function useLogPagination() {
	const [ state, dispatch ] = useReducer( paginationReducer, defaultPaginationState );

	const handlePageClick = useCallback( ( newPageIndex: number ) => {
		dispatch( { type: 'click', newPageIndex } );
	}, [] );

	const handlePageLoad = useCallback( ( { nextScrollId }: { nextScrollId: string | null } ) => {
		dispatch( { type: 'load', nextScrollId } );
	}, [] );

	const { currentPageIndex, currentScrollId } = state;

	return { currentPageIndex, currentScrollId, handlePageClick, handlePageLoad };
}
