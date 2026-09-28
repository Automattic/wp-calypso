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
	compProductId: string;
}

// Lets a screen that does not own this mutation still tell whether a selection is in flight.
export const setCompPlanMutationKey = [ 'paid-newsletter-set-comp-plan' ];

export const useSetCompPlanMutation = (
	options: UseMutationOptions< unknown, DefaultError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationKey: setCompPlanMutationKey,
		mutationFn: async ( { siteId, engine, currentStep, compProductId }: MutationVariables ) => {
			// Optimistically set the value.
			queryClient.setQueryData(
				[ 'paid-newsletter-importer', siteId, engine ],
				( previous: any ) => {
					if ( ! previous ) {
						return previous;
					}
					previous.steps[ 'subscribers' ].content.comp_product_id = compProductId
						? parseInt( compProductId )
						: null;
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
					comp_product_id: compProductId,
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
		( siteId: number, engine: string, currentStep: string, compProductId: string ) =>
			mutate( { siteId, engine, currentStep, compProductId } ),
		[ mutate ]
	);

	return { setCompPlan, ...mutation };
};
