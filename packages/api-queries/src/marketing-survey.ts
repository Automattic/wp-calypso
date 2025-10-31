import { submitMarketingSurvey, UserPreferences, updatePreferences } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { rawUserPreferencesQuery } from './me-preferences';
import { queryClient } from './query-client';

export const marketingSurveyMutation = () =>
	mutationOptions( {
		mutationFn: submitMarketingSurvey,
	} );

export const cancelPurchaseSurveyCompletedMutation = ( purchaseId: string | number ) => {
	const preferenceName = `cancel-purchase-survey-completed-${ purchaseId }`;
	return mutationOptions( {
		mutationFn: () =>
			updatePreferences( {
				[ preferenceName ]: 'true',
			} as Partial< UserPreferences > ),
		onSuccess: ( newData ) => {
			queryClient.setQueryData( rawUserPreferencesQuery().queryKey, ( oldData ) =>
				oldData ? { ...oldData, ...newData } : newData
			);
		},
	} );
};
