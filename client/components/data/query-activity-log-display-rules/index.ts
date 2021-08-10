/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestSiteRetentionPolicy } from 'calypso/state/activity-log/display-rules/actions';
import isRequestingActivityLogDisplayRules from 'calypso/state/selectors/is-requesting-activity-log-display-rules';
import type { AppState } from 'calypso/types';

const useRequestActivityLogDisplayRules = ( siteId: number ) => {
	const dispatch = useDispatch();
	const requesting = useSelector( ( state: AppState ) =>
		isRequestingActivityLogDisplayRules( state, siteId )
	);

	useEffect(
		() => {
			if ( requesting ) {
				return;
			}

			dispatch( requestSiteRetentionPolicy( siteId ) );
		},

		// `requesting` is technically a dependency but we exclude it here;
		// otherwise, it would re-run the effect once the request completes,
		// causing another request to be sent, starting an infinite loop.
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[ siteId ]
	);
};

// TODO: Remove this component once ActivityCardList can call hooks,
// then extract `useRequestActivityLogDisplayRules` into its own file
type OwnProps = {
	siteId: number;
};

const QueryActivityLogDisplayRules: React.FC< OwnProps > = ( { siteId } ) => {
	useRequestActivityLogDisplayRules( siteId );
	return null;
};

export default QueryActivityLogDisplayRules;
