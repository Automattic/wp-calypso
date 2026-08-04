/**
 * Whether the chat is running inside wp-admin.
 *
 * Reads the `wp-admin` body class — core-guaranteed on every admin screen
 * (set in `wp-admin/admin-header.php`) and absent from Calypso pages and
 * public frontends. The same signal the dock's stylesheets style against.
 */
export function isWpAdmin(): boolean {
	if ( typeof document === 'undefined' || ! document.body ) {
		return false;
	}

	return document.body.classList.contains( 'wp-admin' );
}
