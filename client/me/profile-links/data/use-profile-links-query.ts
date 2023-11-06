import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { type ProfileLinkResponse } from './types';

export const useProfileLinksQuery = () => {
	const fetchProfileLinks = (): Promise< ProfileLinkResponse > => {
		return wp.req.get( '/me/settings/profile-links' );
	};

	return useQuery( {
		queryKey: [ 'profile-links' ],
		queryFn: fetchProfileLinks,
		select( data ) {
			return data?.profile_links;
		},
		staleTime: 1000 * 60,
	} );
};
