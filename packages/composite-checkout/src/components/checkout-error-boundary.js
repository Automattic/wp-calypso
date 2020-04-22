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

	componentDidCatch( error ) {
		if ( this.props.onError ) {
			debug( 'reporting error', error );
			this.props.onError( error );
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
	errorMessage: PropTypes.string.isRequired,
	onError: PropTypes.func,
};

function ErrorFallback( { errorMessage } ) {
	return <ErrorContainer>{ errorMessage }</ErrorContainer>;
}

const ErrorContainer = styled.div`
	margin: 2em;
	text-align: center;
`;
