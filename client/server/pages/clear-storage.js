/**
 * Serves a minimal page that wipes this origin's browser storage and reports
 * completion to its embedder. Logout flows on other wordpress.com origins load
 * it in a hidden iframe, since they cannot clear this origin's storage
 * themselves. It stays independent of the app bundles so the iframe loads fast.
 */

const CLEAR_STORAGE_HTML = `<!DOCTYPE html>
<html>
	<head>
		<meta name="robots" content="noindex" />
		<title>Clear storage</title>
	</head>
	<body>
		<script>
			( function () {
				var finished = false;
				function done() {
					if ( finished ) {
						return;
					}
					finished = true;
					if ( window.parent !== window ) {
						window.parent.postMessage( 'clear-storage:done', '*' );
					}
				}
				try {
					window.localStorage.clear();
					window.sessionStorage.clear();
				} catch ( e ) {}
				try {
					var request = window.indexedDB.deleteDatabase( 'calypso' );
					request.onsuccess = request.onerror = request.onblocked = done;
					// deleteDatabase events may never fire (e.g. blocked by another tab).
					setTimeout( done, 1000 );
				} catch ( e ) {
					done();
				}
			} )();
		</script>
	</body>
</html>
`;

export function registerClearStorageRoute( app ) {
	app.get( '/clear-storage', ( req, res ) => {
		res.set( {
			'Content-Security-Policy':
				"frame-ancestors 'self' https://wordpress.com https://*.wordpress.com",
			'Cache-Control': 'no-store',
		} );
		res.send( CLEAR_STORAGE_HTML );
	} );
}
