/**
 * External dependencies
 */
import React from 'react';

type WPCheckoutErrorBoundaryState = {
	hasError: boolean;
	errorMessage: string;
};

const initialWPCheckoutErrorBoundaryState: WPCheckoutErrorBoundaryState = {
	errorMessage: '',
	hasError: false,
};

export default class WpcomCheckoutErrorBoundary extends React.Component {
	state = initialWPCheckoutErrorBoundaryState;
	translate = x => x;

	constructor( props: { translate: ( string ) => string } ) {
		super( props );
		this.translate = props.translate;
	}

	static getDerivedStateFromError( error ): WPCheckoutErrorBoundaryState {
		return {
			hasError: true,
			errorMessage: error,
		};
	}

	render() {
		if ( this.state.hasError ) {
			return <h1>{ this.translate( 'Something went wrong in the billing details step.' ) }</h1>; // eslint-disable-line wpcalypso/i18n-no-this-translate
		}

		return this.props.children;
	}
}
