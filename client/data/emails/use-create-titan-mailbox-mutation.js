import { useCallback } from 'react';
import { useMutation } from 'react-query';
import wpcom from 'calypso/lib/wp';

/**
 * Creates a mailbox for a Professional Email (Titan) account
 *
 * @param {string} domainName The domain name of the mailbox
 * @param  {string} name The name of the user associated with the mailbox
 * @param {string} mailboxName The mailbox name
 * @param  {string} password The password to the mailbox
 * @param {string} alternateEmailAddress An alternate email address where password resets and correspondences are sent
 * @param {boolean} isAdmin The user has admin privileges on the account
 * @param {object} mutationOptions Mutation options passed on to `useMutation`
 * @returns {{ data, error, isLoading: boolean, createTitanMailbox: Function, ...}} Returns various parameters piped from `useMutation`
 */
export function useCreateTitanMailboxMutation(
	domainName,
	name,
	mailboxName,
	password,
	alternateEmailAddress,
	isAdmin = false,
	mutationOptions = null
) {
	const mutation = useMutation(
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

	const { mutateAsync } = mutation;

	// Memoize the `mutate` method into a callback
	const createTitanMailbox = useCallback(
		async ( overrides = null, variables = null ) => {
			return mutateAsync( variables ?? {}, overrides ?? {} );
		},
		[ mutateAsync ]
	);

	// Bundle the callback to make it easy for downstream clients to invoke it
	return { createTitanMailbox, ...mutation };
}
