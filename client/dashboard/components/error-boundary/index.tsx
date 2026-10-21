import { captureException } from '@automattic/calypso-sentry';
import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
	children: ReactNode;
	/**
	 * Rendered in place of the subtree once it has thrown. Attempt to give it the
	 * same shape/height as what it replaces, so a failure doesn't shift the page
	 * around it.
	 */
	fallback: ReactNode;
	/**
	 * Extra Sentry tags to attach to the reported error, e.g.
	 * `{ feature: 'guided-tour' }`.
	 */
	sentryTags?: Record< string, string >;
}

/**
 * Wrap a non-critical piece of UI so that an error thrown while it renders
 * cannot take down the surrounding page: the subtree is replaced by `fallback`
 * while the error is still forwarded to Sentry.
 *
 * Only wrap UI that is safe to lose. Primary content should at least surface
 * its error to the router's error page, unless it can be caught somewhere more
 * appropriate.
 */
export class ErrorBoundary extends Component< ErrorBoundaryProps, { hasError: boolean } > {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		captureException( error, {
			tags: { ...this.props.sentryTags, calypso_section: 'dashboard' },
			extra: { componentStack: errorInfo.componentStack },
		} );
	}

	render() {
		if ( this.state.hasError ) {
			return this.props.fallback;
		}
		return this.props.children;
	}
}
