import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { type ProfileLinkResponse } from './types';

export const useProfileLinksQuery = () => {
	const fetchProfileLinks = async (): Promise< ProfileLinkResponse > => {
		const response = await wp.req.get( '/me/settings/profile-links' );
		return response?.profile_links ?? [];
	};

	return useQuery( {
		queryKey: [ 'profile-links' ],
		queryFn: fetchProfileLinks,
		staleTime: 1000 * 60,
	} );
};
