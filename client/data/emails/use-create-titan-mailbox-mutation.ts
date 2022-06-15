import { useMutation } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { UseMutationOptions } from 'react-query';

/**
 * Creates a mailbox for a Professional Email (Titan) account
 *
 * @param domainName The domain name of the mailbox
 * @param name The name of the user associated with the mailbox
 * @param mailboxName The mailbox name
 * @param password The password to the mailbox
 * @param alternateEmailAddress An alternate email address where password resets and correspondences are sent
 * @param isAdmin The user has admin privileges on the account
 * @param mutationOptions Mutation options passed on to `useMutation`
 * @returns Returns the result of the `useMutation` call
 */
export function useCreateTitanMailboxMutation(
	domainName: string,
	name: string,
	mailboxName: string,
	password: string,
	alternateEmailAddress: string,
	isAdmin = false,
	mutationOptions: UseMutationOptions = {}
) {
	return useMutation(
		() =>
			wpcom.req.post( {
				path: `/emails/titan/${ encodeURIComponent( domainName ) }/mailbox/create`,
				apiNamespace: 'wpcom/v2',
				body: {
					name,
					mailbox: mailboxName,
					password,
					alternate_email_address: alternateEmailAddress,
					is_admin: isAdmin === true,
				},
			} ),
		{ ...mutationOptions, mutationKey: `${ domainName }@${ mailboxName }` }
	);
}
