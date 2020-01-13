/**
 * External dependencies
 */
import React from 'react';

type WPCheckoutErrorBoundaryState = {
	hasError: boolean;
	errorMessage: string;
};

const initialWPCheckoutErrorBoundaryState = {
	errorMessage: '',
	hasError: false,
};

export default class WpcomCheckoutErrorBoundary extends React.Component {
	state = initialWPCheckoutErrorBoundaryState;

	constructor( props ) {
		super( props );
		this.props.translate = props.translate;
	}

	static getDerivedStateFromError( error ): WPCheckoutErrorBoundaryState {
		return {
			hasError: true,
			errorMessage: error,
		};
	}

	render() {
		if ( this.state.hasError ) {
			return (
				<h1>{ this.props.translate( 'Something went wrong in the billing details step.' ) }</h1>
			);
		}

		return this.props.children;
	}
}
