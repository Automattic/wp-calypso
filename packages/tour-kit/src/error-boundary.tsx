import React, { ErrorInfo } from 'react';

type State = {
	hasError: boolean;
};

class ErrorBoundary extends React.Component< { children: React.ReactNode }, State > {
	state = {
		hasError: false,
	};

	static getDerivedStateFromError() {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		// You can also log the error to an error reporting service
		// eslint-disable-next-line no-console
		console.error( error, errorInfo );
	}

	render() {
		if ( this.state.hasError ) {
			// You can render any custom fallback UI
			return <h1>Something went wrong.</h1>;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
