import { Component, lazy, useMemo, Suspense, type ComponentType, type ReactNode } from 'react';

import './style.scss';

const DEFAULT_PLACEHOLDER = <div className="async-load__placeholder" />;

type RequireCallback = () => Promise< { default: ComponentType< any > } >;

/**
 * Contains errors thrown while loading or rendering the async component — most
 * importantly a failed dynamic `import()`, which happens when an ad blocker
 * blocks the chunk request. Without this, that rejection propagates to the React
 * root and unmounts the whole app. Opt in via the `errorBoundary` prop.
 */
class AsyncLoadErrorBoundary extends Component< { children: ReactNode }, { hasError: boolean } > {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch( error: Error ) {
		// Keep the failure observable now that it no longer surfaces as a crash.
		// eslint-disable-next-line no-console
		console.error( 'AsyncLoad failed to load its component:', error );
	}

	render() {
		return this.state.hasError ? null : this.props.children;
	}
}

type AsyncLoadProps = {
	placeholder?: ReactNode;
	require: RequireCallback;
	/**
	 * Contain a failed load instead of letting it crash the app. Off by default
	 * so existing callers are unaffected; turn it on where the async component is
	 * optional and its chunk may be blocked (e.g. by an ad blocker).
	 */
	errorBoundary?: boolean;
	[ key: string ]: unknown;
};

export default function AsyncLoad( {
	placeholder = DEFAULT_PLACEHOLDER,
	require,
	errorBoundary = false,
	...props
}: AsyncLoadProps ) {
	const LazyComponent = useMemo( () => lazy( require ), [ require ] );

	const content = (
		<Suspense fallback={ placeholder }>
			<LazyComponent { ...props } />
		</Suspense>
	);

	return errorBoundary ? <AsyncLoadErrorBoundary>{ content }</AsyncLoadErrorBoundary> : content;
}
