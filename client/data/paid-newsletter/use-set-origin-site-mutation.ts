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
	originSite: string;
}

export const useSetOriginSiteMutation = (
	options: UseMutationOptions< unknown, DefaultError, MutationVariables > = {}
) => {
	const queryClient = useQueryClient();
	const mutation = useMutation( {
		mutationFn: async ( { siteId, engine, currentStep, originSite }: MutationVariables ) => {
			const response = await wp.req.post(
				{
					path: `/sites/${ siteId }/site-importer/paid-newsletter`,
					apiNamespace: 'wpcom/v2',
				},
				{
					engine: engine,
					current_step: currentStep,
					import_url: originSite,
				}
			);

			if ( ! response.import_url ) {
				throw new Error( `Failed to set origin site: ${ JSON.stringify( response ) }` );
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

	const setOriginSite = useCallback(
		( siteId: number, engine: string, currentStep: string, originSite: string ) =>
			mutate( { siteId, engine, currentStep, originSite } ),
		[ mutate ]
	);

	return { setOriginSite, ...mutation };
};
