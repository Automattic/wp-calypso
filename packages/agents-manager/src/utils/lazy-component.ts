import { Component, createElement, lazy, Suspense } from '@wordpress/element';

const RETRY_DELAY_MS = 500;

// Catching a render error needs a class — there is no hook equivalent.
class LazyBoundary extends Component< { children: React.ReactNode }, { failed: boolean } > {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch( error: Error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Failed to load a chat component:', error );
	}

	render() {
		return this.state.failed ? null : this.props.children;
	}
}

/**
 * Wraps a dynamically imported component so it loads on first render — the
 * standard way to keep heavy, rarely-shown components out of the initial
 * bundles. Renders nothing while the chunk loads, and nothing if the chunk
 * fails twice or the component throws: `Suspense` handles neither, so without
 * the boundary a failed picker would take the whole chat down with it.
 */
export default function lazyComponent(
	load: () => Promise< { default: React.ComponentType } >
): React.ComponentType {
	// `lazy()` caches a rejected import, so one failed fetch would keep this
	// component missing for the rest of the page. Retry inside the loader,
	// after a pause — an immediate retry hits the same CDN edge that just
	// 404'd a freshly deployed chunk.
	const Inner = lazy( () =>
		load().catch( () =>
			new Promise( ( resolve ) => setTimeout( resolve, RETRY_DELAY_MS ) ).then( load )
		)
	);

	return function LazyComponent( props: Record< string, unknown > ) {
		return createElement(
			LazyBoundary,
			null,
			createElement( Suspense, { fallback: null }, createElement( Inner, props ) )
		);
	};
}
