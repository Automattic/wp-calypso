import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { suggestTitleAndBlurb } from '../engine/ela';
import { getOnePagerServices } from '../services';
import type { OnePagerContentField } from '../../types';

export interface SuggestOnePagerContentInput {
	brief: string;
	field: OnePagerContentField;
}

type Options = UseMutationOptions< string, Error, SuggestOnePagerContentInput >;

/**
 * Calls the LLM service for a title or blurb suggestion. Replaces the
 * heuristic stand-in in data/use-suggest-one-pager-content.ts now that the
 * one-pager engine ships a real LLM-backed suggestion.
 */
export default function useSuggestOnePagerContent( options?: Options ) {
	return useMutation< string, Error, SuggestOnePagerContentInput >( {
		...options,
		mutationFn: ( { brief, field } ) =>
			suggestTitleAndBlurb( {
				llm: getOnePagerServices().llm,
				inputText: brief,
				field,
			} ),
	} );
}
