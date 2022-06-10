import { useTranslate } from 'i18n-calypso';
import { orderBy } from 'lodash';
import { createElement } from 'react';
import { useIsMutating, useMutation, useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { getCacheKey as getEmailDomainsQueryKey } from 'calypso/data/domains/use-get-domains-query';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import wp from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCacheKey as getEmailAccountsQueryKey } from './use-get-email-accounts-query';
import type { UseMutationOptions } from 'react-query';

type MailboxDetails = {
	destination: string;
	mailbox: string;
};

type Context = {
	[ key: string ]: any;
};

export function useIsLoading() {
	const activeCount = useIsMutating( 'addEmailForward' );

	return Boolean( activeCount );
}

/**
 * Adds an email forward, including relevant optimistic data mutations
 *
 * @param domainName The domain name of the mailbox
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns Returns the result of the `useMutation` call
 */
export default function useAddEmailForwardMutation(
	domainName: string,
	mutationOptions: Omit<
		UseMutationOptions< any, unknown, MailboxDetails, Context >,
		'mutationFn'
	> = {}
) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();

	const selectedSiteId = useSelector( getSelectedSiteId );

	const useGetEmailAccountsQueryKey = getEmailAccountsQueryKey( selectedSiteId, domainName );
	const useGetDomainsQueryKey = getEmailDomainsQueryKey( selectedSiteId );

	const suppliedOnSettled = mutationOptions.onSettled;
	const suppliedOnMutate = mutationOptions.onMutate;
	const suppliedOnError = mutationOptions.onError;

	mutationOptions.mutationKey = 'addEmailForward';

	mutationOptions.onSettled = ( data, error, variables, context ) => {
		suppliedOnSettled?.( data, error, variables, context );

		queryClient.invalidateQueries( useGetEmailAccountsQueryKey );
		queryClient.invalidateQueries( useGetDomainsQueryKey );
	};

	mutationOptions.onMutate = async ( variables ) => {
		const { mailbox, destination } = variables;
		suppliedOnMutate?.( variables );

		await queryClient.cancelQueries( useGetEmailAccountsQueryKey );
		await queryClient.cancelQueries( useGetDomainsQueryKey );

		const previousEmailAccountsQueryData = queryClient.getQueryData< any >(
			useGetEmailAccountsQueryKey
		);
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

			queryClient.setQueryData( useGetEmailAccountsQueryKey, {
				...previousEmailAccountsQueryData,
				accounts: [
					{
						...previousEmailAccountsQueryData.accounts[ 0 ],
						emails: newEmailForwards,
					},
				],
			} );
		}

		const previousDomainsQueryData = queryClient.getQueryData< any >( useGetDomainsQueryKey );

		// Optimistically increment the email_forward counter in `useGetDomainsQuery` data
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

				queryClient.setQueryData( useGetDomainsQueryKey, {
					...previousDomainsQueryData,
					domains: newDomains,
				} );
			}
		}

		return {
			[ JSON.stringify( useGetEmailAccountsQueryKey ) ]: previousEmailAccountsQueryData,
			[ JSON.stringify( useGetDomainsQueryKey ) ]: previousDomainsQueryData,
		};
	};

	mutationOptions.onError = ( error, variables, context ) => {
		suppliedOnError?.( error, variables, context );

		if ( context ) {
			queryClient.setQueryData(
				useGetEmailAccountsQueryKey,
				context[ JSON.stringify( useGetEmailAccountsQueryKey ) ]
			);

			queryClient.setQueryData(
				useGetDomainsQueryKey,
				context[ JSON.stringify( useGetDomainsQueryKey ) ]
			);
		}

		let errorMessage = translate(
			'Failed to add email forwarding record. ' +
				'Please try again or ' +
				'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
			{
				components: {
					contactSupportLink: createElement( 'a', { href: CALYPSO_CONTACT } ),
				},
			}
		);

		if ( error ) {
			errorMessage = translate(
				'Failed to add email forwarding record ' +
					'with message "%(message)s". ' +
					'Please try again or ' +
					'{{contactSupportLink}}contact support{{/contactSupportLink}}.',
				{
					args: {
						message: error,
					},
					components: {
						contactSupportLink: createElement( 'a', { href: CALYPSO_CONTACT } ),
					},
				}
			);
		}

		dispatch( errorNotice( errorMessage ) );
	};

	return useMutation< any, unknown, MailboxDetails, Context >(
		( { mailbox, destination } ) =>
			wp.req.post( `/domains/${ encodeURIComponent( domainName ) }/email/new`, {
				mailbox,
				destination,
			} ),
		mutationOptions
	);
}
