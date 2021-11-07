import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isRequestingRewindSize from 'calypso/state/rewind/selectors/is-requesting-rewind-size';
import { requestSize } from 'calypso/state/rewind/size/actions';
import type { AppState } from 'calypso/types';

export const useQueryRewindSize = ( siteId: number ): void => {
	const dispatch = useDispatch();
	const requesting = useSelector( ( state: AppState ) => isRequestingRewindSize( state, siteId ) );

	useEffect( () => {
		if ( requesting ) {
			return;
		}

		dispatch( requestSize( siteId ) );

		// `requesting` is technically a dependency but we exclude it here;
		// otherwise, it would re-run the effect once the request completes,
		// causing another request to be sent, starting an infinite loop.
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [ siteId ] );
};

type OwnProps = {
	siteId: number;
};

const QueryRewindSize: React.FC< OwnProps > = ( { siteId } ) => {
	useQueryRewindSize( siteId );
	return null;
};

export default QueryRewindSize;
