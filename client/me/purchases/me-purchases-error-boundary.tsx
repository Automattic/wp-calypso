import styled from '@emotion/styled';
import debugFactory from 'debug';
import { ErrorInfo } from 'react';
import * as React from 'react';

const debug = debugFactory( 'calypso:me-purchases-error-boundary' );

export default class MePurchasesErrorBoundary extends React.Component< MePurchasesErrorBoundaryProps > {
	constructor( props: MePurchasesErrorBoundaryProps ) {
		super( props );
	}

	public state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
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

interface MePurchasesErrorBoundaryProps {
	errorMessage: React.ReactNode;
	onError?: ( message: string ) => void;
}

const ErrorContainer = styled.div`
	margin: 2em;
	text-align: center;
`;

function ErrorFallback( { errorMessage }: { errorMessage: React.ReactNode } ) {
	return <ErrorContainer>{ errorMessage }</ErrorContainer>;
}
