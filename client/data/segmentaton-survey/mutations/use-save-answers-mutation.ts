import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type SaveAnswersMutationArgs = {
	surveyKey: string;
	blogId?: number;
};

type SaveAnswersMutationFnArgs = {
	questionKey: string;
	answerKeys: string[];
};

const useSaveAnswersMutation = ( { surveyKey, blogId }: SaveAnswersMutationArgs ) => {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( { answerKeys, questionKey }: SaveAnswersMutationFnArgs ) => {
			return wpcom.req.post( {
				path: '/segmentation-survey/answer',
				apiNamespace: 'wpcom/v2',
				body: {
					blog_id: blogId,
					survey_key: surveyKey,
					question_key: questionKey,
					answers: answerKeys,
				},
			} );
		},
		onSettled: () => {
			void queryClient.invalidateQueries( { queryKey: [ 'survey-answers', surveyKey ] } );
		},
	} );
};

export default useSaveAnswersMutation;
