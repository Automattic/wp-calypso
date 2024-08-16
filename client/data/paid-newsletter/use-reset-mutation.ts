import {
	DefaultError,
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface MutationVariables {
	siteId: string;
	engine: string;
	currentStep: string;
}

export const useSkipNextStepMutation = (
	options: UseMutationOptions< unknown, DefaultError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { siteId, engine, currentStep }: MutationVariables ) => {
			const response = await wp.req.post(
				{
					path: `/sites/${ siteId }/site-importer/paid-newsletter/reset`,
					apiNamespace: 'wpcom/v2',
				},
				{
					engine: engine,
					current_step: currentStep,
				}
			);

			if ( ! response.current_step ) {
				throw new Error( 'unsuccsefully skipped step', response );
			}

			return response;
		},
		...options,
		onSuccess( ...args ) {
			const [ , { siteId, engine, currentStep } ] = args;
			queryClient.invalidateQueries( {
				queryKey: [ 'paid-newsletter-importer', siteId, engine, currentStep ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const resetPaidNewsletter = useCallback(
		( siteId: string, engine: string, currentStep: string ) =>
			mutate( { siteId, engine, currentStep } ),
		[ mutate ]
	);

	return { resetPaidNewsletter, ...mutation };
};
