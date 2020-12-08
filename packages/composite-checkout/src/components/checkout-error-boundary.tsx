/**
 * External dependencies
 */
import React, { ErrorInfo } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import styled from '../lib/styled';

const debug = debugFactory( 'composite-checkout:checkout-error-boundary' );

export default class CheckoutErrorBoundary extends React.Component< CheckoutErrorBoundaryProps > {
	constructor( props: CheckoutErrorBoundaryProps ) {
		super( props );
	}

	public state = { hasError: false, currentError: null };

	static getDerivedStateFromError( error: string ) {
		return { currentError: error, hasError: true };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		if ( this.props.onError ) {
			const errorMessage = `${ error.message }; Stack: ${ error.stack }; Component Stack: ${ errorInfo.componentStack }`;
			debug( 'reporting the error', errorMessage );
			this.props.onError( errorMessage );
		}
	}

	render() {
		if ( this.state.hasError ) {
			return <ErrorFallback errorMessage={ this.props.errorMessage } />;
		}
		return this.props.children;
	}
}

interface CheckoutErrorBoundaryProps {
	errorMessage: React.ReactNode;
	onError?: ( message: string ) => void;
}

function ErrorFallback( { errorMessage }: { errorMessage: React.ReactNode } ) {
	return <ErrorContainer>{ errorMessage }</ErrorContainer>;
}

const ErrorContainer = styled.div`
	margin: 2em;
	text-align: center;
`;
