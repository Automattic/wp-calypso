import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { TitanMailboxFields } from 'calypso/my-sites/email/form/mailboxes/constants';

/**
 * Creates a mailbox for a Professional Email (Titan) account
 * @returns Returns the result of the `useMutation` call
 */
export const useCreateTitanMailboxMutation = () => {
	return useMutation< unknown, unknown, TitanMailboxFields >( {
		mutationFn: ( { domain, isAdmin, mailbox, name, password, passwordResetEmail } ) => {
			return wpcom.req.post( {
				path: `/emails/titan/${ encodeURIComponent( domain ) }/mailbox/create`,
				apiNamespace: 'wpcom/v2',
				body: {
					name,
					mailbox,
					password,
					alternate_email_address: passwordResetEmail,
					is_admin: isAdmin,
				},
			} );
		},
	} );
};
