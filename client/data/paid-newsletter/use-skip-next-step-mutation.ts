import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

export const useSkipNextStepMutation = ( options = {} ) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { siteId, engine, currentStep, skipStep } ) => {
			const response = await wp.req.post(
				{
					path: `/sites/${ siteId }/site-importer/paid-newsletter`,
					apiNamespace: 'wpcom/v2',
				},
				{
					engine: engine,
					current_step: currentStep,
					skip: skipStep,
				}
			);

			if ( ! response.current_step ) {
				throw new Error( 'unsuccsefully skipped step', response );
			}

			return response;
		},
		...options,
		onSuccess( ...args ) {
			const [ , { siteId, engine } ] = args;
			queryClient.invalidateQueries( {
				queryKey: [ 'paid-newsletter-importer', siteId, engine ],
			} );
			options.onSuccess?.( ...args );
		},
	} );

	const { mutate } = mutation;

	const skipNextStep = useCallback(
		( siteId, engine, currentStep, skipStep ) =>
			mutate( { siteId, engine, currentStep, skipStep } ),
		[ mutate ]
	);

	return { skipNextStep, ...mutation };
};
