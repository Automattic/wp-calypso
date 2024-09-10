import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export default function useFetchAgencyFromBlog(
	blogId: number,
	options: { enabled?: boolean } = {}
) {
	const { enabled = true, ...restOptions } = options;

	return useQuery( {
		queryKey: [ 'agency-blog', blogId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/blog/${ blogId }`,
			} ),
		select: ( data ) => {
			return {
				id: data?.id,
				name: data?.name,
			};
		},
		enabled: !! blogId && enabled,
		refetchOnWindowFocus: false,
		...restOptions,
	} );
}
