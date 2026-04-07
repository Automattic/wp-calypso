import {
	DefaultError,
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface MutationVariables {
	siteId: number;
	engine: string;
	currentStep: string;
	stripePlanId: string;
}

export const useSetCompPlanMutation = (
	options: UseMutationOptions< unknown, DefaultError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { siteId, engine, currentStep, stripePlanId }: MutationVariables ) => {
			// Optimistically set the value.
			queryClient.setQueryData(
				[ 'paid-newsletter-importer', siteId, engine ],
				( previous: any ) => {
					if ( ! previous ) {
						return previous;
					}
					previous.steps[ 'subscribers' ].content.comp_stripe_plan_id = stripePlanId;
					return previous;
				}
			);

			const response = await wp.req.post(
				{
					path: `/sites/${ siteId }/site-importer/paid-newsletter/set-comp-plan`,
					apiNamespace: 'wpcom/v2',
				},
				{
					engine: engine,
					current_step: currentStep,
					comp_stripe_plan_id: stripePlanId,
				}
			);

			if ( ! response.current_step ) {
				throw new Error( 'failed to set comp plan' );
			}

			return response;
		},
		...options,
		onSuccess( ...args ) {
			const [ data, { siteId, engine } ] = args;
			queryClient.setQueryData( [ 'paid-newsletter-importer', siteId, engine ], data );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const setCompPlan = useCallback(
		( siteId: number, engine: string, currentStep: string, stripePlanId: string ) =>
			mutate( { siteId, engine, currentStep, stripePlanId } ),
		[ mutate ]
	);

	return { setCompPlan, ...mutation };
};
