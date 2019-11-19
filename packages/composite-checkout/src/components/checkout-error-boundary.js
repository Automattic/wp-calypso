/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

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

CheckoutErrorBoundary.propTypes = {
	errorMessage: PropTypes.string.isRequired,
};

function ErrorFallback( { errorMessage } ) {
	return <ErrorContainer>{ errorMessage }</ErrorContainer>;
}

const ErrorContainer = styled.div`
	margin: 2em;
	text-align: center;
`;
