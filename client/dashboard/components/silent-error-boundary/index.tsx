import { captureException } from '@automattic/calypso-sentry';
import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface SilentErrorBoundaryProps {
	children: ReactNode;
	/**
	 * Extra Sentry tags to attach to the reported error, e.g.
	 * `{ feature: 'guided-tour' }`.
	 */
	sentryTags?: Record< string, string >;
}

/**
 * Wrap a non-critical piece of UI so that an error thrown while it renders
 * cannot take down the surrounding page: the subtree renders nothing while the
 * error is still forwarded to Sentry.
 *
 * Only wrap UI that is safe to lose. Primary content should at least surface
 * its error to the router's error page, unless it can be caught somewhere more
 * appropriate.
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
			tags: { calypso_section: 'dashboard', ...this.props.sentryTags },
			extra: { componentStack: errorInfo.componentStack },
		} );
	}

	render() {
		return this.state.hasError ? null : this.props.children;
	}
}
