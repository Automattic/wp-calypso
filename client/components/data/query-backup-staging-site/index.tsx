import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import isRequestingStagingSiteInfo from 'calypso/state/rewind/selectors/is-requesting-staging-site-info';
import { requestBackupStagingSiteInfo } from 'calypso/state/rewind/staging/actions';
import type { AppState } from 'calypso/types';

export const useQueryBackupStagingSite = ( siteId: number ): void => {
	const dispatch = useDispatch();
	const requesting = useSelector( ( state: AppState ) =>
		isRequestingStagingSiteInfo( state, siteId )
	);

	useEffect( () => {
		if ( requesting ) {
			return;
		}

		dispatch( requestBackupStagingSiteInfo( siteId ) );

		// `requesting` is technically a dependency but we exclude it here;
		// otherwise, it would re-run the effect once the request completes,
		// causing another request to be sent, starting an infinite loop.
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [ siteId ] );
};

type OwnProps = {
	siteId: number;
};

const QueryBackupStagingSite: React.FC< OwnProps > = ( { siteId } ) => {
	useQueryBackupStagingSite( siteId );
	return null;
};

export default QueryBackupStagingSite;
