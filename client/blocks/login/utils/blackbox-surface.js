let activeSurface;
const configurations = new WeakMap();
const configuredSurfaces = new WeakSet();

export function rememberBlackboxKey( api, apiKey ) {
	if ( api && ! configurations.has( api ) ) {
		configurations.set( api, apiKey );
	}
}

/** Register the active form, including submissions made outside React. */
export function activateBlackboxSurface( apiKey ) {
	activeSurface?.controller.abort();
	const controller = new AbortController();
	activeSurface = { apiKey, controller };
	return controller;
}

export function getBlackboxSignal( apiKey ) {
	if ( activeSurface && activeSurface.apiKey !== apiKey ) {
		return AbortSignal.abort();
	}
	return activeSurface?.controller.signal;
}

export function configureBlackbox( api, options, newSurface = false ) {
	const previousKey = configurations.get( api );
	const shouldReset =
		( previousKey && previousKey !== options.apiKey ) ||
		( newSurface && configuredSurfaces.has( api ) );
	api.configure( options );
	configurations.set( api, options.apiKey );
	if ( newSurface ) {
		configuredSurfaces.add( api );
	}
	if ( shouldReset ) {
		api.reset?.();
	}
}
