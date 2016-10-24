
export function registerServerWorker( options = {} ) {
	const path = options.path || '/service-worker.js';
	return window.navigator.serviceWorker.register( path );
}

export function isServiceWorkerSupported() {
	return (
		window &&
		'serviceWorker' in window.navigator &&
		'ServiceWorkerRegistration' in window
	);
}
