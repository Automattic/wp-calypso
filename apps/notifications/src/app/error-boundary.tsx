import { logToLogstash } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Send an error to logstash. Fire-and-forget: logging must never throw and
 * take down the surface it is trying to report on.
 */
export function logError( error: unknown, extra?: Record< string, unknown > ) {
	const err = error instanceof Error ? error : new Error( String( error ) );

	try {
		logToLogstash( {
			feature: 'calypso_client',
			message: err.message || 'Unknown error',
			tags: [ 'notifications' ],
			extra: {
				stack: err.stack,
				...extra,
			},
		} ).catch( () => {} );
	} catch {
		// Never let logging crash the app.
	}
}

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
			return (
				<div className="wpnc-app__error">
					{ __( 'Something went wrong. Please close and reopen notifications.' ) }
				</div>
			);
		}

		return this.props.children;
	}
}
