/**
 * `react/jsx-runtime` for this bundle, aliased in `webpack.config.js`.
 *
 * WordPress registers the JSX runtime as `window.ReactJSXRuntime` from 6.6 on. Using it keeps our
 * elements matched to the React that WordPress ships, which React 19 requires ("A React Element from
 * an older version of React was rendered").
 *
 * The bundle is served from the CDN to every Jetpack release, including those that still allow
 * WordPress 6.5, where that global doesn't exist. There we build elements through
 * `window.React.createElement` instead, which works with whichever React the page has. Bundling
 * React's own runtime would not: Calypso's copy is React 19, whose elements React 18 doesn't render.
 */
import type * as ReactNamespace from 'react';

type JsxFactory = (
	type: ReactNamespace.ElementType,
	config: Record< string, unknown > | null,
	maybeKey?: ReactNamespace.Key
) => ReactNamespace.ReactElement;

export interface JsxRuntime {
	jsx: JsxFactory;
	jsxs: JsxFactory;
	Fragment: typeof ReactNamespace.Fragment;
}

export function createElementRuntime( react: typeof ReactNamespace ): JsxRuntime {
	const withKey = ( config: Record< string, unknown > | null, maybeKey?: ReactNamespace.Key ) =>
		maybeKey === undefined ? config : { ...config, key: maybeKey };

	const jsx: JsxFactory = ( type, config, maybeKey ) =>
		react.createElement( type, withKey( config, maybeKey ) );

	// `jsxs` receives literal siblings, which need no keys. Passed inside `props` they'd be
	// key-checked like a mapped list; as separate arguments createElement accepts them as they are.
	// Babel only emits `jsxs` for two or more children, so createElement still builds an array.
	const jsxs: JsxFactory = ( type, config, maybeKey ) => {
		const { children, ...props } = config ?? {};
		return react.createElement(
			type,
			withKey( props, maybeKey ),
			...( children as ReactNamespace.ReactNode[] )
		);
	};

	return { jsx, jsxs, Fragment: react.Fragment };
}

const globals = window as unknown as {
	React: typeof ReactNamespace;
	ReactJSXRuntime?: JsxRuntime;
};

const runtime = globals.ReactJSXRuntime ?? createElementRuntime( globals.React );

export const { jsx, jsxs, Fragment } = runtime;
