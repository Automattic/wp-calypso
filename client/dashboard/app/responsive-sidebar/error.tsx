import { Component } from 'react';

// Catches invariant errors from route-dependent components that may fire
// during Navigator slide-out animations when the route match is no longer active.
export default class RouteErrorBoundary extends Component<
	{ children: React.ReactNode },
	{ hasError: boolean }
> {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if ( this.state.hasError ) {
			return null;
		}
		return this.props.children;
	}
}
