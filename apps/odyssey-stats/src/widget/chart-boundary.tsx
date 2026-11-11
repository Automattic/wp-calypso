import { Component, ErrorInfo, ReactNode } from 'react';

interface ChartBoundaryProps {
	children: ReactNode;
	/** Rendered in the chart's place once it has failed. */
	fallback: ReactNode;
}

interface ChartBoundaryState {
	hasFailed: boolean;
}

/**
 * Keeps a failing chart from taking the widget with it. The chart is a lazy chunk, which can
 * fail long after the page loaded (a dropped connection, or a deploy replacing its hashed
 * filename), and an error while rendering would otherwise unmount the whole widget root.
 */
export default class ChartBoundary extends Component< ChartBoundaryProps, ChartBoundaryState > {
	state: ChartBoundaryState = { hasFailed: false };

	static getDerivedStateFromError(): ChartBoundaryState {
		return { hasFailed: true };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		// eslint-disable-next-line no-console
		console.error( 'Stats widget: the chart failed to render.', error, errorInfo );
	}

	render() {
		return this.state.hasFailed ? this.props.fallback : this.props.children;
	}
}
