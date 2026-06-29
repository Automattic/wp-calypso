import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/ui';
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
					<Notice.Root intent="error" className="wpnc-app__error-notice">
						<Notice.Title>{ __( 'Something went wrong' ) }</Notice.Title>
						<Notice.Description>
							{ __( 'Please close and reopen notifications.' ) }
						</Notice.Description>
					</Notice.Root>
				</div>
			);
		}

		return this.props.children;
	}
}
