/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import debugFactory from 'debug';

const debug = debugFactory( 'composite-checkout:checkout-error-boundary' );

export default class CheckoutErrorBoundary extends React.Component {
	constructor( props ) {
		super( props );
		this.state = { hasError: false, currentError: null };
	}

	static getDerivedStateFromError( error ) {
		return { currentError: error, hasError: true };
	}

	componentDidCatch( error, errorInfo ) {
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

CheckoutErrorBoundary.propTypes = {
	errorMessage: PropTypes.node.isRequired,
	onError: PropTypes.func,
};

function ErrorFallback( { errorMessage } ) {
	return <ErrorContainer>{ errorMessage }</ErrorContainer>;
}

const ErrorContainer = styled.div`
	margin: 2em;
	text-align: center;
`;
