import {
	addLegacyContact,
	deleteLegacyContact,
	fetchLegacyContact,
	fetchLegacyContacts,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { LegacyContact } from '@automattic/api-core';

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

export const addLegacyContactMutation = () =>
	mutationOptions( {
		mutationFn: ( { email, notes }: { email: string; notes?: string } ) =>
			addLegacyContact( email, notes ),
		onSuccess: () => {
			queryClient.invalidateQueries( legacyContactsQuery() );
		},
	} );

export const deleteLegacyContactMutation = () =>
	mutationOptions( {
		mutationFn: ( legacyContactId: number ) => deleteLegacyContact( legacyContactId ),
		onSuccess: ( _data, legacyContactId ) => {
			// Drop the contact from the cached list right away so the UI returns to
			// the empty state immediately, rather than showing the removed contact
			// until the invalidation refetch below completes.
			queryClient.setQueryData< LegacyContact[] >(
				legacyContactsQuery().queryKey,
				( contacts ) =>
					contacts?.filter( ( contact ) => contact.legacy_contact_id !== legacyContactId )
			);
			queryClient.invalidateQueries( legacyContactsQuery() );
			// Drop the single-contact query from the cache; it holds a sensitive
			// `access_key` that should not linger after the contact is removed.
			queryClient.removeQueries( { queryKey: legacyContactQuery( legacyContactId ).queryKey } );
		},
	} );
