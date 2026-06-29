import { __ } from '@wordpress/i18n';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError } from '../panel/helpers/log-error';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component< Props, State > {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		logError( error, { componentStack: errorInfo.componentStack } );
	}

	render() {
		if ( this.state.hasError ) {
			// A slightly opaque overlay over the panel (rather than replacing it)
			// so the surrounding chrome stays put and the user keeps their context
			// instead of the panel collapsing to a bare message.
			return (
				<div className="wpnc-app__error" role="alert">
					<p className="wpnc-app__error-message">
						{ __( 'Something went wrong. Please close and reopen notifications.' ) }
					</p>
				</div>
			);
		}

		return this.props.children;
	}
}
