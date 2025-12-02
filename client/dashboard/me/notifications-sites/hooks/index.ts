import { userNotificationsSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';

export const useSiteSettings = ( blogId: number ) => {
	return useSuspenseQuery( {
		...userNotificationsSettingsQuery(),
		select: ( data ) => data?.blogs.find( ( blog ) => blog.blog_id === blogId ),
		staleTime: 1000 * 60 * 5,
	} );
};
