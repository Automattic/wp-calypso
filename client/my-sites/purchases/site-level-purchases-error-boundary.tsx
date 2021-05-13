/**
 * External dependencies
 */
import React, { ErrorInfo } from 'react';
import debugFactory from 'debug';
import styled from '@emotion/styled';

const debug = debugFactory( 'calypso:site-level-purchases-error-boundary' );

export default class SiteLevelPurchasesErrorBoundary extends React.Component< SiteLevelPurchasesErrorBoundaryProps > {
	constructor( props: SiteLevelPurchasesErrorBoundaryProps ) {
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

interface SiteLevelPurchasesErrorBoundaryProps {
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
