import config from '@automattic/calypso-config';

/**
 * The Hosting Dashboard lives on its own origin (e.g. my.wordpress.com), so
 * logging out here can't clear its persisted caches directly. Instead, load
 * its /clear-storage page in a hidden iframe (same-site, so not affected by
 * storage partitioning) and wait for its completion message. Best effort:
 * resolves after `timeout` ms no matter what, so logout is never blocked.
 */
export function clearHostingDashboardStorage( timeout = 2000 ): Promise< void > {
	const url = config< string | false >( 'hosting_dashboard_clear_storage_url' );
	if ( ! url || typeof document === 'undefined' || document.body === null ) {
		return Promise.resolve();
	}

	return new Promise( ( resolve ) => {
		const iframe = document.createElement( 'iframe' );
		const listener = new AbortController();

		const finish = () => {
			listener.abort();
			iframe.remove();
			resolve();
		};

		window.addEventListener(
			'message',
			( event ) => {
				if ( event.source === iframe.contentWindow && event.data === 'clear-storage:done' ) {
					finish();
				}
			},
			{ signal: listener.signal }
		);
		setTimeout( finish, timeout );

		iframe.hidden = true;
		iframe.src = url;
		document.body.appendChild( iframe );
	} );
}
