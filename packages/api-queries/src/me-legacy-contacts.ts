import { fetchLegacyContacts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const legacyContactsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'legacy-contacts' ],
		queryFn: fetchLegacyContacts,
	} );
