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
			return (
				<div className="wpnc-app__error">
					{ __( 'Something went wrong. Please close and reopen notifications.' ) }
				</div>
			);
		}

		return this.props.children;
	}
}
