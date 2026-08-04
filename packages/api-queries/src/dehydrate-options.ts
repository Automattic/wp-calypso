import { defaultShouldDehydrateQuery, type Query } from '@tanstack/react-query';

// What is written to storage, and what is left out of it.
//
// A paused mutation is persisted by default, on the expectation that the app registers mutation
// defaults and calls `resumePausedMutations` after restoring. Nothing here does either, and
// dehydration carries no `mutationFn`, so a restored mutation has nothing to run and nothing to
// ask it to. It would sit in the cache as permanently pending, holding any scope it declared and
// counting towards `useIsMutating` for the rest of the session. Excluding them takes away
// nothing that worked.
//
// Not re-exported from the package barrel: this is internal policy, not API.
export const dehydrateOptions = {
	shouldRedactErrors: () => false,
	shouldDehydrateMutation: () => false,
	shouldDehydrateQuery: ( query: Query ) => {
		const persist = query.meta?.persist;
		if ( persist === false ) {
			return false;
		}
		// Gate the predicate behind the default check so it is never handed the
		// data of a query that hasn't succeeded.
		if ( ! defaultShouldDehydrateQuery( query ) ) {
			return false;
		}
		return typeof persist === 'function' ? persist( query.state.data ) : true;
	},
};
