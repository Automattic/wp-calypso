import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type SaveAnswersMutationParams = {
	surveyKey: string;
	blogId?: number;
};

type SaveAnswersMutationFnParams = {
	questionKey: string;
	answerKeys: string[];
};

const useSaveAnswersMutation = ( { surveyKey, blogId }: SaveAnswersMutationParams ) => {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( { answerKeys, questionKey }: SaveAnswersMutationFnParams ) => {
			return wpcom.req.post( {
				path: `/segmentation-survey/answers`,
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
