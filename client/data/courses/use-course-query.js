import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const useCourseQuery = ( courseSlug, queryOptions = {} ) => {
	return useQuery(
		[ 'courses', courseSlug ],
		() => wpcom.req.get( '/courses', { course_slug: courseSlug, apiNamespace: 'wpcom/v2' } ),
		{
			refetchOnReconnect: true,
			refetchOnWindowFocus: false,
			...queryOptions,
			meta: {
				...queryOptions.meta,
			},
		}
	);
};

export default useCourseQuery;
