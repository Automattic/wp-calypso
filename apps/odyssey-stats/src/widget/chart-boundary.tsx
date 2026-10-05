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
 * Keeps a failing chart from taking the widget with it.
 *
 * The chart is a lazy chunk, so it can fail long after the page loaded — a dropped
 * connection, or a deploy that replaced the hashed filename this page was served. `Suspense`
 * covers the wait, not the failure: an error thrown while rendering unmounts the whole widget
 * root, blanking the totals, the lists and the links along with the chart.
 *
 * A class is the only way to catch that; hooks have no equivalent of `componentDidCatch`.
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
