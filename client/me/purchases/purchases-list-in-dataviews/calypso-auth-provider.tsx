import { useMemo } from 'react';
import { AuthContext } from 'calypso/dashboard/app/auth';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { User } from '@automattic/api-core';

export function CalypsoAuthProvider( { children }: { children: React.ReactNode } ) {
	const currentUser = useSelector( getCurrentUser );
	const value = useMemo(
		() => ( {
			// Calypso's user object has the same shape for the fields consumed by MSD components
			// (useLocale reads localeVariant/localeSlug/locale_variant/language; OwnerInfo reads ID).
			user: currentUser as unknown as User,
			// Calypso handles its own logout; this provider exists only to satisfy MSD component hooks.
			logout: async () => {},
		} ),
		[ currentUser ]
	);

	return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}
