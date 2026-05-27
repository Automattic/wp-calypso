import 'calypso/state/reader/init';
import { createSelector } from '@automattic/state-utils';
import { reject } from 'lodash';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { AppState } from 'calypso/types';
import { ReaderFollowItem, ReaderFollowState } from './types';

/*
 * Get all sites/feeds the user follows.
 */
const getReaderFollows = createSelector(
	( state: AppState ) => {
		const follows: ReaderFollowState = state.reader.follows;
		// remove subs where the sub has an error
		const items: ReaderFollowItem[] = reject( Object.values( follows.items ), 'error' );

		// this is important. don't mutate the original items.
		const withSite = items.map( ( item ) => ( {
			...item,
			site: getSite( state, item.blog_ID ) as {
				is_error?: boolean;
				error?: { statusCode?: number };
			},
		} ) );

		// remove subs where the site has a gone error
		const withoutErrors = reject(
			withSite,
			( item ) => item.site && item.site.is_error && item.site.error?.statusCode === 410
		) as typeof withSite;

		return withoutErrors;
	},
	( state ) => [
		state.reader.follows.items,
		state.reader.sites.items,
		state.currentUser.capabilities,
	]
);

export default getReaderFollows;
