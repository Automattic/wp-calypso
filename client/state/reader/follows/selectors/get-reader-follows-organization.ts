import 'calypso/state/reader/init';
import { createSelector } from '@automattic/state-utils';
import { sorter } from 'calypso/state/reader/follows/selectors/get-reader-followed-sites';
import { AppState } from 'calypso/types';
import { ReaderFollowItem, ReaderFollowState } from './types';

/**
 * Get sites by organization id
 */
const getOrganizationSites = createSelector(
	( state: AppState, organizationId: number ): ReaderFollowItem[] => {
		const follows: ReaderFollowState = state.reader.follows;

		// remove subs where the sub has an error
		return Object.values( follows.items )
			.filter( ( blog ) => blog.organization_id === organizationId )
			.sort( sorter );
	},
	( state: AppState ) => [ state.reader.follows.items, state.currentUser.capabilities ]
);

export default getOrganizationSites;
