import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPolicies } from 'calypso/state/rewind/policies/actions';
import isRequestingRewindPolicies from 'calypso/state/rewind/selectors/is-requesting-rewind-policies';
import type { AppState } from 'calypso/types';

export const useQueryRewindPolicies = ( siteId: number ): void => {
	const dispatch = useDispatch();
	const requesting = useSelector( ( state: AppState ) =>
		isRequestingRewindPolicies( state, siteId )
	);

	useEffect(
		() => {
			if ( requesting ) {
				return;
			}

			dispatch( requestPolicies( siteId ) );
		},

		// `requesting` is technically a dependency but we exclude it here;
		// otherwise, it would re-run the effect once the request completes,
		// causing another request to be sent, starting an infinite loop.
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[ siteId ]
	);
};

// TODO: Remove this component once ActivityCardList can call hooks,
// then extract `useRequestRewindPolicies` into its own file
type OwnProps = {
	siteId: number;
};

const QueryRewindPolicies: React.FC< OwnProps > = ( { siteId } ) => {
	useQueryRewindPolicies( siteId );
	return null;
};

export default QueryRewindPolicies;
