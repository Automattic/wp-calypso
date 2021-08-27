import styled from '@emotion/styled';
import debugFactory from 'debug';
import React, { ErrorInfo } from 'react';

const debug = debugFactory( 'composite-checkout:checkout-error-boundary' );

const ErrorContainer = styled.div`
	margin: 2em;
	text-align: center;
`;

export default class CheckoutErrorBoundary extends React.Component< CheckoutErrorBoundaryProps > {
	constructor( props: CheckoutErrorBoundaryProps ) {
		super( props );
	}

	public state = { hasError: false };

	static getDerivedStateFromError(): { hasError: true } {
		return { hasError: true };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ): void {
		if ( this.props.onError ) {
			const errorMessage = `${ error.message }; Stack: ${ error.stack }; Component Stack: ${ errorInfo.componentStack }`;
			debug( 'reporting the error', errorMessage );
			this.props.onError( errorMessage );
		}
	}

	render(): JSX.Element | JSX.Element[] | undefined {
		if ( this.state.hasError ) {
			return <ErrorFallback errorMessage={ this.props.errorMessage } />;
		}
		return this.props.children;
	}
}

interface CheckoutErrorBoundaryProps {
	errorMessage: React.ReactNode;
	onError?: ( message: string ) => void | undefined;
	children?: JSX.Element[] | JSX.Element;
}

function ErrorFallback( { errorMessage }: { errorMessage: React.ReactNode } ) {
	return <ErrorContainer>{ errorMessage }</ErrorContainer>;
}
