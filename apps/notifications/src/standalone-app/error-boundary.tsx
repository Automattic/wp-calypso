import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureException } from '../lib/sentry';

/**
 * Shown when the widget can't render — either a render-time crash caught by the
 * boundary below, or a boot failure (e.g. the proxy-auth request never
 * resolving). Surfaces the failure and a way to recover instead of a frozen
 * spinner.
 */
export const NotificationsErrorFallback = () => (
	<div className="wpnc-app__error-boundary">
		<p>{ __( 'Notifications couldn’t load.', 'notifications' ) }</p>
		<Button variant="secondary" onClick={ () => window.location.reload() }>
			{ __( 'Reload', 'notifications' ) }
		</Button>
	</div>
);

type Props = {
	children: ReactNode;
};

type State = {
	hasError: boolean;
};

/**
 * Catches render-time crashes in the notifications widget and reports them to
 * Sentry. Without this, an exception unmounts the React tree and leaves the
 * user on a frozen spinner.
 */
export default class ErrorBoundary extends Component< Props, State > {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		captureException( error, { componentStack: errorInfo.componentStack } );
	}

	render() {
		if ( ! this.state.hasError ) {
			return this.props.children;
		}

		return <NotificationsErrorFallback />;
	}
}
