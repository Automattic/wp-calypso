import { CALYPSO_CONTACT } from '@automattic/urls';
import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { orderBy } from 'lodash';
import { getCacheKey as getEmailDomainsQueryKey } from 'calypso/data/domains/use-get-domains-query';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCacheKey as getEmailAccountsQueryKey } from './use-get-email-accounts-query';
import type { UseMutationOptions } from '@tanstack/react-query';

type AddMailboxFormData = {
	destination: string;
	mailbox: string;
};

type Context = {
	[ key: string ]: any;
};

const MUTATION_KEY = 'addEmailForward';

export function useIsLoading() {
	const activeCount = useIsMutating( {
		mutationKey: [ MUTATION_KEY ],
	} );

	return Boolean( activeCount );
}

/**
 * Adds an email forward, including relevant optimistic data mutations
 * @param domainName The domain name of the mailbox
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns Returns the result of the `useMutation` call
 */
export default function useAddEmailForwardMutation(
	domainName: string,
	mutationOptions: Omit<
		UseMutationOptions< any, unknown, AddMailboxFormData, Context >,
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

	mutationOptions.onMutate = async ( variables ) => {
		const { mailbox, destination } = variables;
		suppliedOnMutate?.( variables );

		await queryClient.cancelQueries( { queryKey: emailAccountsQueryKey } );
		await queryClient.cancelQueries( { queryKey: domainsQueryKey } );

		const previousEmailAccountsQueryData = queryClient.getQueryData< any >( emailAccountsQueryKey );
		const emailForwards = previousEmailAccountsQueryData?.accounts?.[ 0 ]?.emails;

		// Optimistically add email forward to `useGetEmailAccountsQuery` data
		if ( emailForwards ) {
			const newEmailForwards = orderBy(
				[
					...emailForwards,
					{
						domain: domainName,
						email_type: 'email_forward',
						is_verified: false,
						mailbox,
						role: 'standard',
						target: destination,
						temporary: true,
						warnings: [],
					},
				],
				[ 'mailbox' ],
				[ 'asc' ]
			);

			queryClient.setQueryData( emailAccountsQueryKey, {
				...previousEmailAccountsQueryData,
				accounts: [
					{
						...previousEmailAccountsQueryData.accounts[ 0 ],
						emails: newEmailForwards,
					},
				],
			} );
		}

		const previousDomainsQueryData = queryClient.getQueryData< any >( domainsQueryKey );

		// Optimistically increment `email_forwards_count` in `useGetDomainsQuery` data
		if ( previousDomainsQueryData ) {
			const selectedDomainIndex = previousDomainsQueryData.domains.findIndex(
				( { domain }: { domain: string } ) => domain === domainName
			);

			if ( selectedDomainIndex >= 0 ) {
				const selectedDomain = previousDomainsQueryData.domains[ selectedDomainIndex ];
				const newDomains = [ ...previousDomainsQueryData.domains ];

				newDomains.splice( selectedDomainIndex, 1, {
					...selectedDomain,
					email_forwards_count: selectedDomain.email_forwards_count + 1,
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

	mutationOptions.onError = ( error, variables, context ) => {
		suppliedOnError?.( error, variables, context );

		if ( context ) {
			queryClient.setQueryData(
				emailAccountsQueryKey,
				context[ JSON.stringify( emailAccountsQueryKey ) ]
			);

			queryClient.setQueryData( domainsQueryKey, context[ JSON.stringify( domainsQueryKey ) ] );
		}

		const noticeComponents = {
			contactSupportLink: <a href={ CALYPSO_CONTACT } />,
			strong: <strong />,
		};

		let errorMessage = translate(
			'Failed to add email forward for {{strong}}%(emailAddress)s{{/strong}}. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
			{
				args: {
					emailAddress: variables.mailbox,
				},
				components: noticeComponents,
			}
		);

		if ( error ) {
			errorMessage = translate(
				'Failed to add email forward for {{strong}}%(emailAddress)s{{/strong}} with message "%(message)s". Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
				{
					args: {
						emailAddress: variables.mailbox,
						message: error as string,
					},
					components: noticeComponents,
				}
			);
		}

		dispatch( errorNotice( errorMessage ) );
	};

	return useMutation< any, unknown, AddMailboxFormData, Context >( {
		mutationFn: ( { mailbox, destination } ) =>
			wp.req.post( `/domains/${ encodeURIComponent( domainName ) }/email/new`, {
				mailbox,
				destination,
			} ),
		...mutationOptions,
	} );
}
