import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import wp from 'calypso/lib/wp';

interface Variables {
	siteId: number;
}

export default function useAddEcommerceTrialMutation(
	partnerBundle: string | null,
	options: UseMutationOptions< unknown, unknown, Variables > = {}
) {
	const partnerData = partnerBundle
		? {
				woocommerce_onboarding_profile: {
					partner: partnerBundle,
				},
		  }
		: undefined;
	const mutation = useMutation( {
		mutationFn: async ( { siteId }: Variables ) => {
			await wp.req.post(
				`/sites/${ siteId }/ecommerce-trial/add/ecommerce-trial-bundle-monthly`,
				{
					apiVersion: '1.1',
				},
				{
					is_entrepreneur_signup: 1,
					wpcom_woocommerce_onboarding: partnerData,
				}
			);
		},
		...options,
	} );

	const { mutate } = mutation;

	const addEcommerceTrial = useCallback( ( siteId: number ) => mutate( { siteId } ), [ mutate ] );

	return { addEcommerceTrial, ...mutation };
}
