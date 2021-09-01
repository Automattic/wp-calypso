import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isRequestingRewindSize from 'calypso/state/rewind/selectors/is-requesting-rewind-size';
import { requestSize } from 'calypso/state/rewind/size/actions';

export const useQueryRewindSize = ( siteId: number ): void => {
	const requesting = useSelector( ( state ) => isRequestingRewindSize( state, siteId ) );
	const dispatch = useDispatch();

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
