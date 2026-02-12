import {
	commentAuthorAvatar,
	postList,
	create,
	tag,
	comment,
	bell,
	chartBar,
	media,
	addSubmenu,
} from '@wordpress/icons';

/**
 * Maps permission names to their corresponding WordPress icons.
 * @param permissionName - The name of the permission
 * @returns The corresponding icon or undefined if not found
 */
export const getPermissionIcon = (
	permissionName: string
): typeof commentAuthorAvatar | undefined => {
	const iconMap: Record< string, typeof commentAuthorAvatar > = {
		users: commentAuthorAvatar,
		posts: postList,
		follow: create,
		taxonomy: tag,
		comments: comment,
		notifications: bell,
		stats: chartBar,
		media: media,
		menus: addSubmenu,
	};
	return iconMap[ permissionName ];
};
