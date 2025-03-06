import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { MutationSaveFeedbackVariables } from '../types';

const SURVEY_ID_PREFIX = 'a4a-feedback-';

interface APIFeedback {
	success: boolean;
	err: string | null;
}

function mutationSaveFeedback( { params }: MutationSaveFeedbackVariables ): Promise< APIFeedback > {
	// Add a prefix to params.survey_id
	const prefixedParams = {
		...params,
		survey_id: `${ SURVEY_ID_PREFIX }${ params.survey_id }`,
	};

	return wpcom.req.post( {
		path: '/marketing/survey',
		apiNamespace: 'wpcom/v2',
		body: prefixedParams,
	} );
}

export default function useSaveFeedbackMutation< TContext = unknown >(
	options?: UseMutationOptions< APIFeedback, Error, MutationSaveFeedbackVariables, TContext >
): UseMutationResult< APIFeedback, Error, MutationSaveFeedbackVariables, TContext > {
	return useMutation< APIFeedback, Error, MutationSaveFeedbackVariables, TContext >( {
		...options,
		mutationFn: ( args ) => mutationSaveFeedback( { ...args } ),
	} );
}
