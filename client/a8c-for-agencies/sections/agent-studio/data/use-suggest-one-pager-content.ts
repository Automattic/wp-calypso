import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { agentStudioService } from './agent-studio-service';
import type { OnePagerContentField } from '../types';

export interface SuggestOnePagerContentInput {
	brief: string;
	field: OnePagerContentField;
}

type Options = UseMutationOptions< string, Error, SuggestOnePagerContentInput >;

export default function useSuggestOnePagerContent( options?: Options ) {
	return useMutation< string, Error, SuggestOnePagerContentInput >( {
		...options,
		mutationFn: ( { brief, field } ) => agentStudioService.suggestOnePagerContent( brief, field ),
	} );
}
