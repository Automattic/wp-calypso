import styled from '@emotion/styled';
import { Component } from 'react';
import type { ReactNode } from 'react';

const ErrorContainer = styled.div`
	margin: 2em;
	text-align: center;
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
			this.props.onError( error );
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
