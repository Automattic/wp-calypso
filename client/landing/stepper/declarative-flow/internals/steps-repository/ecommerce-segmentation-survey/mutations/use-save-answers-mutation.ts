import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type SaveAnswersHookArgs = {
	surveyKey: string;
	userId?: number | null;
	anonId?: string;
	blogId?: number;
};

type SaveAnswersMutationArgs = {
	questionKey: string;
	answerKeys: string[];
};

const useSaveAnswersMutation = ( { surveyKey, userId, anonId, blogId }: SaveAnswersHookArgs ) => {
	return useMutation( {
		mutationFn: async ( { answerKeys, questionKey }: SaveAnswersMutationArgs ) => {
			return wpcom.req.post( {
				path: `/segmentation-survey`,
				apiNamespace: 'wpcom/v2',
				body: {
					user_id: userId,
					anon_id: anonId,
					blog_id: blogId,
					survey_key: surveyKey,
					question_key: questionKey,
					answer_key: answerKeys,
				},
			} );
		},
	} );
};

export default useSaveAnswersMutation;
