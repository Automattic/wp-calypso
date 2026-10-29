const activeSurfaces = [];
const configurations = new WeakMap();
const configuredSurfaces = new WeakSet();

export function rememberBlackboxKey( api, apiKey ) {
	if ( api && ! configurations.has( api ) ) {
		configurations.set( api, apiKey );
	}
}

/**
 * Register a mounted form, including submissions made outside React. The most
 * recently activated form that is still mounted is the active surface.
 * @param {string} apiKey Public key for this surface.
 * @returns {{ signal: AbortSignal, deactivate: Function }} The form's lifetime, and a
 *   function that unregisters it and cancels its submissions.
 */
export function activateBlackboxSurface( apiKey ) {
	const surface = { apiKey, controller: new AbortController() };
	activeSurfaces.push( surface );
	return {
		signal: surface.controller.signal,
		deactivate: () => {
			surface.controller.abort();
			const index = activeSurfaces.indexOf( surface );
			if ( index !== -1 ) {
				activeSurfaces.splice( index, 1 );
			}
		},
	};
}

export function getBlackboxSignal( apiKey ) {
	const activeSurface = activeSurfaces[ activeSurfaces.length - 1 ];
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
