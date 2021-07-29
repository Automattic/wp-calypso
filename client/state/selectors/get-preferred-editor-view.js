/**
 * Internal dependencies
 */
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
import { getAdminMenu } from 'calypso/state/admin-menu/selectors';

export const getPreferredEditorView = ( state, siteId ) => {
	if ( ! isNavUnificationEnabled( state ) ) {
		return 'default';
	}

	const menu = getAdminMenu( state, siteId );
	if ( ! menu ) {
		return 'default';
	}
	const postsMenuItem = menu.find( ( item ) => item.slug === 'edit-php' );
	if ( ! postsMenuItem ) {
		return 'default';
	}

	return postsMenuItem.url.includes( 'wp-admin/edit.php' ) ? 'classic' : 'default';
};
