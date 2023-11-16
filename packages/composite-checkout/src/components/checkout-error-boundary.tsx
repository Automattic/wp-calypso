import styled from '@emotion/styled';
import { Component } from 'react';
import type { ReactNode } from 'react';

const ErrorContainer = styled.div`
	display: flex;
	text-align: center;
	height: 190px;
	width: 100%;
	align-items: center;
	justify-content: center;
`;

export default class CheckoutErrorBoundary extends Component< CheckoutErrorBoundaryProps > {
	constructor( props: CheckoutErrorBoundaryProps ) {
		super( props );
	}

	public state = { hasError: false };

	static getDerivedStateFromError(): { hasError: true } {
		return { hasError: true };
	}

	componentDidCatch( error: Error ): void {
		if ( this.props.onError ) {
			if ( error.message.length === 0 ) {
				// I don't know how it happens but sometimes there's no error
				// message so let's not log an empty string.
				const errorWithCause = new Error( 'No error message found!', { cause: error } );
				this.props.onError( errorWithCause );
				return;
			}

			// If there is no custom error message, just report the error.
			if ( typeof this.props.errorMessage !== 'string' || this.props.errorMessage.length === 0 ) {
				this.props.onError( error );
				return;
			}

			// Use the custom error message as the error and include the
			// original error as the cause.
			const errorContext = this.props.errorMessage;
			const errorWithCause = new Error( errorContext, { cause: error } );
			if ( ! errorWithCause.cause ) {
				// It's standard but it's possible that some browsers might not
				// support the second argument to the Error constructor so we
				// provide a fallback here.
				this.props.onError( error );
				return;
			}
			this.props.onError( errorWithCause );
		}
	}

	render(): ReactNode {
		if ( this.state.hasError ) {
			return <ErrorFallback errorMessage={ this.props.errorMessage } />;
		}
		return this.props.children;
	}
}

interface CheckoutErrorBoundaryProps {
	errorMessage: ReactNode;
	onError?: ( error: Error ) => void;
	children?: ReactNode;
}

function ErrorFallback( { errorMessage }: { errorMessage: ReactNode } ) {
	return <ErrorContainer>{ errorMessage }</ErrorContainer>;
}
