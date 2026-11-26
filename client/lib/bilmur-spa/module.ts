import config from '@automattic/calypso-config';

// Types for `bilmur-spa` (or rather, the used subset thereof).
// Since the module is loaded at runtime, we need to keep a local definition of the types here.
interface BilmurSpa {
	init( options: { beaconOrigin?: string } ): void;
	startNavigation( routeName: string, routePath: string, navigationKey: object ): void;
	completeNavigation( navigationKey: object ): void;
}

type ImportModule = ( url: string ) => Promise< BilmurSpa >;

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

let bilmur: BilmurSpa | undefined;

// Normalize module URL to work with `import()`.
function getModuleUrl() {
	const url = new URL( config< string >( 'bilmur_spa_url' ), document.baseURI );
	url.searchParams.set( 'w', String( Math.floor( Date.now() / ONE_WEEK ) ) );
	return url.href;
}

// Where to send the reports in place of production, if anywhere.
// The config value is a URL relative to the page, so you can use `/` to send them
// to the origin, or `https://localhost:<port>/` to send to a different local server.
function getBeaconOrigin() {
	const beaconOrigin = config< string >( 'bilmur_spa_beacon_origin' );
	return beaconOrigin ? new URL( beaconOrigin, document.baseURI ).origin : undefined;
}

/**
 * Imports `bilmur-spa` and starts measuring.
 */
export function loadBilmurSpa(
	importModule: ImportModule = ( url ) => import( /* webpackIgnore: true */ /* @vite-ignore */ url )
) {
	if ( bilmur || ! config.isEnabled( 'bilmur-spa' ) || ! document.getElementById( 'bilmur' ) ) {
		return Promise.resolve();
	}

	return Promise.resolve()
		.then( () => importModule( getModuleUrl() ) )
		.then( ( module ) => {
			module.init( { beaconOrigin: getBeaconOrigin() } );
			bilmur = module;
		} )
		.catch( () => {} );
}

export function startNavigation( routeName: string, routePath: string, navigationKey: object ) {
	try {
		bilmur?.startNavigation( routeName, routePath, navigationKey );
	} catch {
		// Ignore errors, to avoid breaking the app if something fails.
	}
}

export function completeNavigation( navigationKey: object ) {
	try {
		bilmur?.completeNavigation( navigationKey );
	} catch {
		// Same as above.
	}
}
