import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { useSite } from './use-site';

export const useIsSiteAdmin = () => {
	const site = useSite();
	const isFetching = ! site;

	const isAdmin = useSelector( ( state ) => canCurrentUser( state, site?.ID, 'manage_options' ) );

	return useMemo(
		() => ( {
			isFetching,
			isAdmin: isFetching ? null : isAdmin,
		} ),
		[ isAdmin, isFetching ]
	);
};
