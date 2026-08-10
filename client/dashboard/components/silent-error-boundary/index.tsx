import { captureException } from '@automattic/calypso-sentry';
import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface SilentErrorBoundaryProps {
	children: ReactNode;
	/**
	 * What to render once a child has thrown. Defaults to nothing, so the
	 * subtree simply disappears.
	 */
	fallback?: ReactNode;
	/**
	 * Extra Sentry tags to attach to the reported error, e.g.
	 * `{ feature: 'guided-tour' }`.
	 */
	tags?: Record< string, string >;
}

/**
 * Contains a non-critical piece of UI so that an error thrown while it renders
 * cannot take down the surrounding page: the subtree is replaced with
 * `fallback` (nothing by default) while the error is still forwarded to Sentry.
 *
 * Only wrap UI that is safe to lose. Primary content should surface its error
 * to the router's error page instead of being silently swallowed here.
 */
export class SilentErrorBoundary extends Component<
	SilentErrorBoundaryProps,
	{ hasError: boolean }
> {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		captureException( error, {
			tags: { calypso_section: 'dashboard', ...this.props.tags },
			extra: { componentStack: errorInfo.componentStack },
		} );
	}

	render() {
		if ( this.state.hasError ) {
			return this.props.fallback ?? null;
		}
		return this.props.children;
	}
}
