import { useMemo } from 'react';
import { AuthContext } from 'calypso/dashboard/app/auth';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { User } from '@automattic/api-core';

export function CalypsoAuthProvider( { children }: { children: React.ReactNode } ) {
	const currentUser = useSelector( getCurrentUser );
	const value = useMemo(
		() => ( {
			user: currentUser as unknown as User,
			logout: async () => {},
		} ),
		[ currentUser ]
	);

	return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}
