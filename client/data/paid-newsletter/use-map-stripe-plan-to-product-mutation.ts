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
	stripePlan: string;
	productId: string;
}

export const useMapStripePlanToProductMutation = (
	options: UseMutationOptions< unknown, DefaultError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( {
			siteId,
			engine,
			currentStep,
			stripePlan,
			productId,
		}: MutationVariables ) => {
			const response = await wp.req.post(
				{
					path: `/sites/${ siteId }/site-importer/paid-newsletter/map-stripe-plan-to-product`,
					apiNamespace: 'wpcom/v2',
				},
				{
					engine: engine,
					current_step: currentStep,
					stripe_plan_id: stripePlan,
					product_id: productId,
				}
			);

			if ( ! response.current_step ) {
				throw new Error( 'unsuccsefully skipped step', response );
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

	const mapStripePlanToProduct = useCallback(
		(
			siteId: number,
			engine: string,
			currentStep: string,
			stripePlan: string,
			productId: string
		) => mutate( { siteId, engine, currentStep, stripePlan, productId } ),
		[ mutate ]
	);

	return { mapStripePlanToProduct, ...mutation };
};
