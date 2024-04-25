import { CALYPSO_CONTACT } from '@automattic/urls';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { getCacheKey as getEmailDomainsQueryKey } from 'calypso/data/domains/use-get-domains-query';
import { getEmailAddress } from 'calypso/lib/emails';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCacheKey as getEmailAccountsQueryKey } from './use-get-email-accounts-query';
import type { EmailAccountEmail } from './types';
import type { UseMutationOptions } from '@tanstack/react-query';

type Context = {
	[ key: string ]: any;
};

const MUTATION_KEY = 'removeEmailForward';

/**
 * Deletes an email forward, including relevant optimistic data mutations.
 * @param domainName The domain name of the mailbox
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns Returns the result of the `useMutation` call
 */
export default function useRemoveEmailForwardMutation(
	domainName: string,
	mutationOptions: Omit<
		UseMutationOptions< any, unknown, EmailAccountEmail, Context >,
		'mutationFn'
	> = {}
) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();

	const selectedSiteId = useSelector( getSelectedSiteId );

	const emailAccountsQueryKey = getEmailAccountsQueryKey( selectedSiteId, domainName );
	const domainsQueryKey = getEmailDomainsQueryKey( selectedSiteId );

	const suppliedOnSettled = mutationOptions.onSettled;
	const suppliedOnMutate = mutationOptions.onMutate;
	const suppliedOnError = mutationOptions.onError;

	mutationOptions.mutationKey = [ MUTATION_KEY ];

	mutationOptions.onSettled = ( data, error, variables, context ) => {
		suppliedOnSettled?.( data, error, variables, context );

		queryClient.invalidateQueries( { queryKey: emailAccountsQueryKey } );
		queryClient.invalidateQueries( { queryKey: domainsQueryKey } );
	};

	mutationOptions.onMutate = async ( emailForward ) => {
		suppliedOnMutate?.( emailForward );

		await queryClient.cancelQueries( { queryKey: emailAccountsQueryKey } );
		await queryClient.cancelQueries( { queryKey: domainsQueryKey } );

		const previousEmailAccountsQueryData = queryClient.getQueryData< any >( emailAccountsQueryKey );

		const emailForwards = previousEmailAccountsQueryData?.accounts?.[ 0 ]?.emails;

		// Optimistically remove email forward from `useGetEmailAccountsQuery` data
		if ( emailForwards ) {
			queryClient.setQueryData( emailAccountsQueryKey, {
				...previousEmailAccountsQueryData,
				accounts: [
					{
						...previousEmailAccountsQueryData.accounts[ 0 ],
						emails: emailForwards.filter(
							( forward: EmailAccountEmail ) => forward.mailbox !== emailForward.mailbox
						),
					},
				],
			} );
		}

		const previousDomainsQueryData = queryClient.getQueryData< any >( domainsQueryKey );

		// Optimistically decrement `email_forwards_count` in `useGetDomainsQuery` data
		if ( previousDomainsQueryData ) {
			const selectedDomainIndex = previousDomainsQueryData.domains.findIndex(
				( { domain }: { domain: string } ) => domain === domainName
			);

			if ( selectedDomainIndex >= 0 ) {
				const selectedDomain = previousDomainsQueryData.domains[ selectedDomainIndex ];
				const newDomains = [ ...previousDomainsQueryData.domains ];

				newDomains.splice( selectedDomainIndex, 1, {
					...selectedDomain,
					email_forwards_count: selectedDomain.email_forwards_count - 1,
				} );

				queryClient.setQueryData( domainsQueryKey, {
					...previousDomainsQueryData,
					domains: newDomains,
				} );
			}
		}

		return {
			[ JSON.stringify( emailAccountsQueryKey ) ]: previousEmailAccountsQueryData,
			[ JSON.stringify( domainsQueryKey ) ]: previousDomainsQueryData,
		};
	};

	mutationOptions.onError = ( error, emailForward, context ) => {
		suppliedOnError?.( error, emailForward, context );

		if ( context ) {
			queryClient.setQueryData(
				emailAccountsQueryKey,
				context[ JSON.stringify( emailAccountsQueryKey ) ]
			);

			queryClient.setQueryData( domainsQueryKey, context[ JSON.stringify( domainsQueryKey ) ] );
		}

		const emailAddress = getEmailAddress( emailForward );

		const errorMessage = errorNotice(
			translate(
				'Failed to remove email forward for {{strong}}%(emailAddress)s{{/strong}}. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
				{
					comment:
						'%(emailAddress)s is the receiver email address for the email forward being deleted',
					args: { emailAddress },
					components: {
						contactSupportLink: <a href={ CALYPSO_CONTACT } />,
						strong: <strong />,
					},
				}
			),
			{ duration: 7000 }
		);

		dispatch( errorMessage );
	};

	return useMutation< any, unknown, EmailAccountEmail, Context >( {
		mutationFn: ( { mailbox } ) =>
			wp.req.post(
				`/domains/${ encodeURIComponent( domainName ) }/email/${ encodeURIComponent(
					mailbox
				) }/delete`
			),
		...mutationOptions,
	} );
}
