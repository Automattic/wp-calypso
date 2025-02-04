import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcom from 'calypso/lib/wp';

function useUpdateUserCourseProgressionMutation( queryOptions = {} ) {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: ( { courseSlug, videoSlug } ) =>
			wpcom.req.post(
				'/courses/videos',
				{
					apiNamespace: 'wpcom/v2',
				},
				{
					course_slug: courseSlug,
					video_slug: videoSlug,
				}
			),
		...queryOptions,
		onSuccess( data, variables, context ) {
			queryClient.invalidateQueries( {
				queryKey: [ 'courses', variables.courseSlug ],
			} );
			queryOptions.onSuccess?.( data, variables, context );
		},
	} );

	const { mutate } = mutation;

	const updateUserCourseProgression = useCallback(
		( courseSlug, videoSlug ) => mutate( { courseSlug, videoSlug } ),
		[ mutate ]
	);

	return { updateUserCourseProgression, ...mutation };
}

export default useUpdateUserCourseProgressionMutation;
