import { ErrorBoundary } from '../error-boundary';
import type { ReactNode } from 'react';

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
export function SilentErrorBoundary( { children, sentryTags }: SilentErrorBoundaryProps ) {
	return (
		<ErrorBoundary fallback={ null } sentryTags={ sentryTags }>
			{ children }
		</ErrorBoundary>
	);
}
