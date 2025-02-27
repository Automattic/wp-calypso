import {
	DefaultError,
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';
import { StepId } from './use-paid-newsletter-query';

interface MutationVariables {
	siteId: number;
	engine: string;
	currentStep: StepId;
	import_url?: string;
}

export const useResetMutation = (
	options: UseMutationOptions< unknown, DefaultError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { siteId, engine, currentStep, import_url }: MutationVariables ) => {
			const response = await wp.req.post(
				{
					path: `/sites/${ siteId }/site-importer/paid-newsletter/reset`,
					apiNamespace: 'wpcom/v2',
				},
				{
					engine: engine,
					current_step: currentStep,
					...( import_url && { import_url } ),
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

	const resetPaidNewsletter = useCallback(
		( siteId: number, engine: string, currentStep: StepId, import_url?: string ) =>
			mutate( {
				siteId,
				engine,
				currentStep,
				...( import_url && { import_url } ),
			} ),
		[ mutate ]
	);

	return { resetPaidNewsletter, ...mutation };
};
