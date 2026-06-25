import { fetchLegacyContact, fetchLegacyContacts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const legacyContactsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'legacy-contacts' ],
		queryFn: fetchLegacyContacts,
		// The response carries personal data (legacy contact email), so keep it
		// out of the persisted (localStorage) query cache to limit its exposure.
		meta: { persist: false },
	} );

export const legacyContactQuery = ( legacyContactId: number ) =>
	queryOptions( {
		queryKey: [ 'me', 'legacy-contacts', legacyContactId ],
		queryFn: () => fetchLegacyContact( legacyContactId ),
		// The response carries a sensitive `access_key`, so keep it out of the
		// persisted (localStorage) query cache to limit its exposure.
		meta: { persist: false },
	} );
