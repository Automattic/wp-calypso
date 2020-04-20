/**
 * External dependencies
 */
import React from 'react';
declare type WPCheckoutErrorBoundaryState = {
	hasError: boolean;
	errorMessage: string;
};
export default class WpcomCheckoutErrorBoundary extends React.Component {
	state: WPCheckoutErrorBoundaryState;
	translate: ( x: any ) => any;
	constructor( props: { translate: ( string: any ) => string } );
	static getDerivedStateFromError( error: any ): WPCheckoutErrorBoundaryState;
	render(): {} | null | undefined;
}
export {};
