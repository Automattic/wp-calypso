import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type LinkAnswersMutationArgs = {
	blogId: number;
	surveyKey: string;
};

const useLinkAnswersMutation = () => {
	return useMutation( {
		mutationFn: async ( { blogId, surveyKey }: LinkAnswersMutationArgs ) => {
			return wpcom.req.post( {
				path: '/segmentation-survey/answers/link',
				apiNamespace: 'wpcom/v2',
				body: {
					blog_id: blogId,
					survey_key: surveyKey,
				},
			} );
		},
	} );
};

export default useLinkAnswersMutation;
