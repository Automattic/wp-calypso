import {
	userNotificationsSettingsQuery,
	userNotificationsSettingsMutation,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

export const useSiteSettings = ( blogId: number ) => {
	return useSuspenseQuery( {
		...userNotificationsSettingsQuery(),
		select: ( data ) => data?.blogs.find( ( blog ) => blog.blog_id === blogId ),
		staleTime: 1000 * 60 * 5,
	} );
};

export const useSettingsMutation = () => {
	return useMutation( {
		...userNotificationsSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Settings saved successfully.' ),
				error: __( 'There was a problem saving your changes. Please, try again.' ),
			},
		},
	} );
};
