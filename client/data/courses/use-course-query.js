import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const useCourseQuery = ( courseSlug, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'courses', courseSlug ],
		queryFn: () =>
			wpcom.req.get( '/courses', { course_slug: courseSlug, apiNamespace: 'wpcom/v2' } ),
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		...queryOptions,
		meta: {
			...queryOptions.meta,
		},
	} );
};

export default useCourseQuery;
