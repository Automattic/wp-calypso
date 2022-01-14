import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import wpcom from 'calypso/lib/wp';

function useUpdateUserCourseProgressionMutation( queryOptions = {} ) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		( { courseSlug, videoSlug } ) =>
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
		{
			...queryOptions,
			onSuccess( data, variables, context ) {
				queryClient.invalidateQueries( [ 'courses', variables.courseSlug ] );
				queryOptions.onSuccess?.( data, variables, context );
			},
		}
	);

	const { mutate } = mutation;

	const updateUserCourseProgression = useCallback(
		( courseSlug, videoSlug ) => mutate( { courseSlug, videoSlug } ),
		[ mutate ]
	);

	return { updateUserCourseProgression, ...mutation };
}

export default useUpdateUserCourseProgressionMutation;
