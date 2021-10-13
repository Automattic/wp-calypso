import { getAdminMenu } from 'calypso/state/admin-menu/selectors';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';

export const getPreferredEditorView = ( state, siteId, postType = 'post' ) => {
	if ( ! isNavUnificationEnabled( state ) ) {
		return 'default';
	}

	const menu = getAdminMenu( state, siteId );
	if ( ! menu ) {
		return 'default';
	}
	let menuSlug = 'edit-php';
	if ( postType !== 'post' ) {
		menuSlug += `post_type${ postType }`;
	}
	const postsMenuItem = menu.find( ( item ) => item.slug === menuSlug );
	if ( ! postsMenuItem ) {
		return 'default';
	}

	return postsMenuItem.url.includes( 'wp-admin/edit.php' ) ? 'classic' : 'default';
};
