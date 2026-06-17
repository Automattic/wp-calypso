import { fetchLegacyContacts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const legacyContactsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'legacy-contacts' ],
		queryFn: fetchLegacyContacts,
		// Each contact carries a sensitive `token`, so keep this response out of
		// the persisted (localStorage) query cache to limit its exposure.
		meta: { persist: false },
	} );
