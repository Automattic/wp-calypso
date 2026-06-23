import { fetchLegacyContact, fetchLegacyContacts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const legacyContactsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'legacy-contacts' ],
		queryFn: fetchLegacyContacts,
	} );

export const legacyContactQuery = ( id: number ) =>
	queryOptions( {
		queryKey: [ 'me', 'legacy-contacts', id ],
		queryFn: () => fetchLegacyContact( id ),
		// The response carries a sensitive `access_key`, so keep it out of the
		// persisted (localStorage) query cache to limit its exposure.
		meta: { persist: false },
	} );
