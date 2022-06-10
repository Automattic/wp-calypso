import { useTranslate } from 'i18n-calypso';
import { createElement } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { getCacheKey as getEmailDomainsQueryKey } from 'calypso/data/domains/use-get-domains-query';
import { getEmailAddress } from 'calypso/lib/emails';
import wp from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCacheKey as getEmailAccountsQueryKey } from './use-get-email-accounts-query';
import type { UseMutationOptions } from 'react-query';

type EmailForward = {
	domain: string;
	email_type: 'email_forward';
	is_verified: boolean;
	mailbox: string;
	role: string;
	target: string;
	warnings: any[];
};

type Context = {
	[ key: string ]: any;
};

/**
 * Deletes an email forward
 *
 * @param domainName The domain name of the mailbox
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns Returns the result of the `useMutation` call
 */
export default function useRemoveEmailForwardMutation(
	domainName: string,
	mutationOptions: Omit<
		UseMutationOptions< any, unknown, EmailForward, Context >,
		'mutationFn'
	> = {}
) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();

	const selectedSiteId = useSelector( getSelectedSiteId );

	const emailDomainsQueryKey = getEmailAccountsQueryKey( selectedSiteId, domainName );
	const domainsQueryKey = getEmailDomainsQueryKey( selectedSiteId );

	const suppliedOnSettled = mutationOptions.onSettled;
	const suppliedOnMutate = mutationOptions.onMutate;
	const suppliedOnError = mutationOptions.onError;
	const suppliedOnSuccess = mutationOptions.onSuccess;

	mutationOptions.mutationKey = 'removeEmailForward';

	mutationOptions.onSettled = ( data, error, variables, context ) => {
		suppliedOnSettled?.( data, error, variables, context );

		queryClient.invalidateQueries( emailDomainsQueryKey );
		queryClient.invalidateQueries( domainsQueryKey );
	};

	mutationOptions.onMutate = async ( emailForward ) => {
		suppliedOnMutate?.( emailForward );

		await queryClient.cancelQueries( emailDomainsQueryKey );

		// Optimistically remove email forward from `useGetEmailAccountsQuery` data
		const previousEmailAccountsQueryData = queryClient.getQueryData< any >( emailDomainsQueryKey );

		const emailForwards = previousEmailAccountsQueryData.accounts?.[ 0 ]?.emails;

		if ( emailForwards ) {
			queryClient.setQueryData( emailDomainsQueryKey, {
				...previousEmailAccountsQueryData,
				accounts: [
					{
						...previousEmailAccountsQueryData.accounts[ 0 ],
						emails: emailForwards.filter(
							( forward: EmailForward ) => forward.mailbox === emailForward.mailbox
						),
					},
				],
			} );
		}

		return {
			[ JSON.stringify( emailDomainsQueryKey ) ]: previousEmailAccountsQueryData,
		};
	};

	mutationOptions.onSuccess = ( data, emailForward, context ) => {
		suppliedOnSuccess?.( data, emailForward, context );

		const emailAddress = getEmailAddress( emailForward );

		const successMessage = successNotice(
			translate( '{{strong}}%(emailAddress)s{{/strong}} has been removed from your account', {
				comment:
					'%(emailAddress)s is the receiver email address for the email forward being deleted',
				args: { emailAddress },
				components: {
					strong: createElement( 'strong' ),
				},
			} ),
			{ duration: 7000 }
		);

		dispatch( successMessage );
	};

	mutationOptions.onError = ( error, emailForward, context ) => {
		suppliedOnError?.( error, emailForward, context );

		if ( context ) {
			queryClient.setQueryData(
				emailDomainsQueryKey,
				context[ JSON.stringify( emailDomainsQueryKey ) ]
			);
		}

		const emailAddress = getEmailAddress( emailForward );

		const errorMessage = errorNotice(
			translate(
				'There was an error removing {{strong}}%(emailAddress)s{{/strong}} from your account',
				{
					comment:
						'%(emailAddress)s is the receiver email address for the email forward being deleted',
					args: { emailAddress },
					components: {
						strong: createElement( 'strong' ),
					},
				}
			),
			{ duration: 7000 }
		);

		dispatch( errorMessage );
	};

	return useMutation< any, unknown, EmailForward, Context >(
		( { mailbox } ) =>
			wp.req.post(
				`/domains/${ encodeURIComponent( domainName ) }/email/${ encodeURIComponent(
					mailbox
				) }/delete`
			),
		mutationOptions
	);
}
