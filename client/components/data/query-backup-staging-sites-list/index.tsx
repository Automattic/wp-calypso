import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import isFetchingStagingSitesList from 'calypso/state/rewind/selectors/is-fetching-staging-sites-list';
import { requestBackupStagingSitesList } from 'calypso/state/rewind/staging/actions';
import type { AppState } from 'calypso/types';

export const useQueryBackupStagingSitesList = ( siteId: number ): void => {
	const dispatch = useDispatch();
	const requesting = useSelector( ( state: AppState ) =>
		isFetchingStagingSitesList( state, siteId )
	);

	useEffect( () => {
		if ( requesting ) {
			return;
		}

		dispatch( requestBackupStagingSitesList( siteId ) );

		// `requesting` is technically a dependency but we exclude it here;
		// otherwise, it would re-run the effect once the request completes,
		// causing another request to be sent, starting an infinite loop.
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [ siteId ] );
};

type OwnProps = {
	siteId: number;
};

const QueryBackupStagingSitesList: React.FC< OwnProps > = ( { siteId } ) => {
	useQueryBackupStagingSitesList( siteId );
	return null;
};

export default QueryBackupStagingSitesList;
