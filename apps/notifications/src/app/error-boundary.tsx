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
		const { hasError } = this.state;

		// The list stays mounted so it announces the notice when it appears.
		return (
			<>
				{ ! hasError && this.props.children }
				<Notice.List>
					{ hasError && (
						<div className="wpnc-app__error">
							<Notice.Root intent="error" politeness="assertive" className="wpnc-app__error-notice">
								<Notice.Title>{ __( 'Something went wrong' ) }</Notice.Title>
								<Notice.Description>
									{ __( 'Please close and reopen notifications.' ) }
								</Notice.Description>
							</Notice.Root>
						</div>
					) }
				</Notice.List>
			</>
		);
	}
}
