import { EmailBox } from '@automattic/api-core';
import { userMailboxesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { mapMailboxToEmail } from '../mappers/mailbox-to-email-mapper';
import type { Email } from '../types';

export const useUserEmailAddresses = (): Email[] => {
	const { data: allEmailAccounts } = useQuery( userMailboxesQuery() );

	const emails: Email[] = useMemo( () => {
		if ( ! allEmailAccounts?.length ) {
			return [];
		}

		return allEmailAccounts
			.flatMap( ( account ) =>
				account.emails.map( ( box: EmailBox ) => mapMailboxToEmail( box, account ) )
			)
			.filter( ( email ) => email.canUserManage ) as Email[];
	}, [ allEmailAccounts ] );

	return emails;
};
