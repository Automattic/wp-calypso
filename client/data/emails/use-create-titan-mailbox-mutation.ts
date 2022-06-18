import { useMutation } from 'react-query';
import wpcom from 'calypso/lib/wp';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_DOMAIN,
	FIELD_IS_ADMIN,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
} from 'calypso/my-sites/email/form/mailboxes/constants';

type TitanMailboxFields = {
	[ FIELD_DOMAIN ]: string;
	[ FIELD_NAME ]: string;
	[ FIELD_MAILBOX ]: string;
	[ FIELD_PASSWORD ]: string;
	[ FIELD_ALTERNATIVE_EMAIL ]: string;
	[ FIELD_IS_ADMIN ]: boolean;
};

/**
 * Creates a mailbox for a Professional Email (Titan) account
 *
 * @returns Returns the result of the `useMutation` call
 */
const useCreateTitanMailboxMutation = () => {
	return useMutation< unknown, unknown, TitanMailboxFields >(
		( { alternativeEmail, domain, isAdmin, mailbox, name, password } ) => {
			return wpcom.req.post( {
				path: `/emails/titan/${ encodeURIComponent( domain ) }/mailbox/create`,
				apiNamespace: 'wpcom/v2',
				body: {
					name,
					mailbox,
					password,
					alternate_email_address: alternativeEmail,
					is_admin: isAdmin,
				},
			} );
		}
	);
};

export { useCreateTitanMailboxMutation };
export type { TitanMailboxFields };
