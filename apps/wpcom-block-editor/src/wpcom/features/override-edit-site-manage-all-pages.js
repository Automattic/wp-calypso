import apiFetch from '@wordpress/api-fetch';
import domReady from '@wordpress/dom-ready';

/**
 * Ensures that the Site Editor's "Manage all pages" link leads to the preferred view.
 */
const overrideManageAllPagesLink = async () => {
	const siteEditor = document.querySelector( '#site-editor' );
	if ( ! siteEditor ) {
		return;
	}

	const adminMenu = await apiFetch( {
		path: '/wpcom/v2/admin-menu',
	} );
	const pagesMenuItem = adminMenu.find( ( { slug } ) => slug === 'edit-phppost_typepage' );
	if ( ! pagesMenuItem?.url ) {
		return;
	}

	const isClassicViewPreferred = pagesMenuItem.url.includes( '/wp-admin/' );
	if ( isClassicViewPreferred ) {
		return;
	}

	const preferredManageAllPagesUrl = `https://wordpress.com${ pagesMenuItem.url }`;
	siteEditor.addEventListener( 'click', ( e ) => {
		if ( ! e.target.matches( '.edit-site-sidebar-navigation-screen-pages__see-all' ) ) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		document.location = preferredManageAllPagesUrl;
	} );
};

domReady( overrideManageAllPagesLink );
