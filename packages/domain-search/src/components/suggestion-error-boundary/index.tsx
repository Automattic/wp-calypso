import { Component, type ReactNode } from 'react';

interface SuggestionErrorBoundaryProps {
	children: ReactNode;
}

/**
 * Renders nothing for a result card that throws, so one broken card doesn't
 * unmount the whole page. useSuggestion already reports a missing suggestion
 * through `events.onSuggestionNotFound` before throwing.
 */
export class SuggestionErrorBoundary extends Component< SuggestionErrorBoundaryProps > {
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
