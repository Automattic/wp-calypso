/**
 * External dependencies
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Internal dependencies
 */
import { ChartError } from './ChartError';

interface Props {
	children: ReactNode;
	chartData?: string;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component to catch and handle chart rendering errors
 * Prevents the entire chat window from crashing when chart errors occur
 *
 * NOTE: This must remain a class component. React does not yet support error
 * boundaries as functional components or hooks. The componentDidCatch and
 * getDerivedStateFromError lifecycle methods are only available in class components.
 * See: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ChartErrorBoundary extends Component< Props, State > {
	constructor( props: Props ) {
		super( props );
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError( error: Error ): State {
		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		console.error( 'Chart rendering error:', error );
		console.error( 'Error info:', errorInfo );

		if ( this.props.chartData ) {
			console.error(
				'Chart data that caused the error:',
				this.props.chartData
			);

			try {
				const parsed = JSON.parse( this.props.chartData );
				console.error( 'Parsed chart data:', parsed );
			} catch ( parseError ) {
				console.error( 'Could not parse chart data as JSON' );
			}
		}

		this.setState( {
			errorInfo,
		} );
	}

	render() {
		if ( this.state.hasError ) {
			const errorMessage =
				this.state.error?.message ||
				'An error occurred while rendering the chart';
			const errorDetails = [
				'The chart could not be rendered due to an error.',
				'The error has been logged to the console.',
			];

			return (
				<ChartError
					message={ errorMessage }
					details={ errorDetails.join( '\n' ) }
				/>
			);
		}

		return this.props.children;
	}
}
