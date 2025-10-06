import { useRouter, useMatches } from '@tanstack/react-router';
import { useCallback } from 'react';
import type { ToOptions } from '@tanstack/react-router';

const useBuildCurrentRouteLink = () => {
	const router = useRouter();
	const matches = useMatches();
	const lastMatch = matches[ matches.length - 1 ];

	return useCallback(
		( options: ToOptions ) => {
			return router.buildLocation( {
				to: lastMatch.fullPath,
				params: {
					...lastMatch.params,
					...options.params,
				},
			} ).href;
		},
		[ router, lastMatch ]
	);
};

export default useBuildCurrentRouteLink;
