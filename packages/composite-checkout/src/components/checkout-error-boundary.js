/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize';

export default class CheckoutErrorBoundary extends React.Component {
	constructor( props ) {
		super( props );
		this.state = { hasError: false, currentError: null };
	}

	static getDerivedStateFromError( error ) {
		return { currentError: error, hasError: true };
	}

	render() {
		if ( this.state.hasError ) {
			return <ErrorFallback errorMessage={ this.props.errorMessage } />;
		}
		return this.props.children;
	}
}

function ErrorFallback( { errorMessage } ) {
	const localize = useLocalize();
	return (
		<ErrorContainer>
			{ errorMessage || localize( 'Sorry, there was an error on this page.' ) }
		</ErrorContainer>
	);
}

const ErrorContainer = styled.div`
	margin: 2em;
	text-align: center;
`;
