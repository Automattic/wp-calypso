import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const useCourseQuery = ( courseSlug, queryOptions = {} ) => {
	return useQuery(
		[ 'courses', courseSlug ],
		() => wpcom.req.get( '/courses', { course_slug: courseSlug, apiNamespace: 'wpcom/v2' } ),
		{
			// Our course offering doesn't change that often, we don't need to
			// re-fetch until the next page refresh.
			staleTime: Infinity,
			...queryOptions,
			meta: {
				persist: false,
				...queryOptions.meta,
			},
		}
	);
};

export default useCourseQuery;
