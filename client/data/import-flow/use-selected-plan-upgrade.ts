import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

const DEFAULT_PLAN = 'business';
const SELECTED_PLAN_QUERY_KEY = 'selected-plan-for-upgrade';

export const DONT_ADD_PLAN_TO_CART = 'dont-add-plan-to-cart';

/**
 * Use this query/mutation to set/get the chosen plan
 * from the pre-migration step on import flows
 */

export const useSelectedPlanUpgradeQuery = () => {
	const queryClient = useQueryClient();

	return useQuery( {
		queryKey: [ SELECTED_PLAN_QUERY_KEY ],
		queryFn: (): string => {
			return queryClient.getQueryData( [ SELECTED_PLAN_QUERY_KEY ] ) || DEFAULT_PLAN;
		},
	} );
};

export const useSelectedPlanUpgradeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( plan: string ) => {
			queryClient.setQueryData( [ SELECTED_PLAN_QUERY_KEY ], plan );
		},
	} );
};
