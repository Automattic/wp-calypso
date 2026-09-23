import { activeAgencyQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { FeedbackAnswer, FeedbackType } from './types';

const PREFERENCE = 'a4a-feedback';

export function useMilestoneFeedback( type: FeedbackType ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: answered, isLoading: isLoadingPreference } = useQuery(
		userPreferenceQuery( PREFERENCE )
	);

	const agencyId = agency?.id;
	const entry = answered?.[ type ];
	const shouldAsk =
		!! agencyId && ! isLoadingPreference && ! entry?.lastSubmittedAt && ! entry?.lastSkippedAt;

	const submit = useCallback(
		( _answer: FeedbackAnswer, { onSuccess }: { onSuccess: () => void } ) => {
			onSuccess();
		},
		[]
	);

	const skip = useCallback( () => {}, [] );

	return { shouldAsk, submit, skip, isSubmitting: false };
}
