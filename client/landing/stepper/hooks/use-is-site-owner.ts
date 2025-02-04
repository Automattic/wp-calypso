import { useMemo } from 'react';
import { useSite } from './use-site';

export const useIsSiteOwner = () => {
	const site = useSite();
	const isFetching = ! site;
	const isOwner = site?.capabilities?.own_site ?? false;

	return useMemo(
		() => ( {
			isFetching,
			isOwner: isFetching ? null : isOwner,
		} ),
		[ isOwner, isFetching ]
	);
};
