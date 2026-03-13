import { CALYPSO_CONTACT } from '@automattic/urls';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCacheKey as getEmailAccountsQueryKey } from './use-get-email-accounts-query';
import type { AlterDestinationParams, EmailAccountEmail, EmailAccountsQueryData } from './types';
import type { UpdateEmailForwardResponse } from '@automattic/api-core';
import type { UseMutationOptions } from '@tanstack/react-query';

type UpdateEmailForwardParams = AlterDestinationParams & {
	newDestination: string;
};

type Context = {
	emailAccountsQueryData: EmailAccountsQueryData | undefined;
};

const MUTATION_KEY = 'updateEmailForward';

/**
 * Updates an email forward's destination, including relevant optimistic data mutations.
 * @param domainName The domain name of the mailbox
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns Returns the result of the `useMutation` call
 */
export default function useUpdateEmailForwardMutation(
	domainName: string,
	mutationOptions: Omit<
		UseMutationOptions< UpdateEmailForwardResponse, unknown, UpdateEmailForwardParams, Context >,
		'mutationFn'
	> = {}
) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();

	const selectedSiteId = useSelector( getSelectedSiteId );

	const emailAccountsQueryKey = getEmailAccountsQueryKey( selectedSiteId, domainName );

	const suppliedOnSettled = mutationOptions.onSettled;
	const suppliedOnSuccess = mutationOptions.onSuccess;
	const suppliedOnMutate = mutationOptions.onMutate;
	const suppliedOnError = mutationOptions.onError;

	mutationOptions.mutationKey = [ MUTATION_KEY ];

	mutationOptions.onSettled = ( data, error, variables, context ) => {
		suppliedOnSettled?.( data, error, variables, context );

		queryClient.invalidateQueries( { queryKey: emailAccountsQueryKey } );
	};

	mutationOptions.onSuccess = ( data, params, context ) => {
		suppliedOnSuccess?.( data, params, context );

		dispatch(
			successNotice(
				translate(
					'Email forward updated. Please check %(newDestination)s to verify the new address.',
					{
						args: { newDestination: params.newDestination },
					}
				),
				{ duration: 10000 }
			)
		);
	};

	mutationOptions.onMutate = async ( params ) => {
		suppliedOnMutate?.( params );

		await queryClient.cancelQueries( { queryKey: emailAccountsQueryKey } );

		const previousEmailAccountsQueryData =
			queryClient.getQueryData< EmailAccountsQueryData >( emailAccountsQueryKey );

		const emailForwards = previousEmailAccountsQueryData?.accounts?.[ 0 ]?.emails;

		// Optimistically update the forward's target in `useGetEmailAccountsQuery` data
		if ( previousEmailAccountsQueryData && emailForwards ) {
			queryClient.setQueryData( emailAccountsQueryKey, {
				...previousEmailAccountsQueryData,
				accounts: [
					{
						...previousEmailAccountsQueryData.accounts[ 0 ],
						emails: emailForwards.map( ( forward: EmailAccountEmail ) => {
							if ( forward.mailbox === params.mailbox && forward.target === params.destination ) {
								return {
									...forward,
									target: params.newDestination,
									is_verified: false,
								};
							}
							return forward;
						} ),
					},
				],
			} );
		}

		return {
			emailAccountsQueryData: previousEmailAccountsQueryData,
		};
	};

	mutationOptions.onError = ( error, params, context ) => {
		suppliedOnError?.( error, params, context );

		if ( context ) {
			queryClient.setQueryData( emailAccountsQueryKey, context.emailAccountsQueryData );
		}

		dispatch(
			errorNotice(
				translate(
					'Failed to update email forward for {{strong}}%(mailbox)s@%(domain)s{{/strong}}. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
					{
						args: {
							mailbox: params.mailbox,
							domain: params.domain,
						},
						components: {
							contactSupportLink: <a href={ CALYPSO_CONTACT } />,
							strong: <strong />,
						},
					}
				),
				{ duration: 7000 }
			)
		);
	};

	return useMutation< UpdateEmailForwardResponse, unknown, UpdateEmailForwardParams, Context >( {
		mutationFn: ( { mailbox, destination, newDestination } ) => {
			return wp.req.post(
				`/domains/${ encodeURIComponent( domainName ) }/email/${ encodeURIComponent( mailbox ) }`,
				{
					destination,
					new_destination: newDestination,
				}
			);
		},
		...mutationOptions,
	} );
}
