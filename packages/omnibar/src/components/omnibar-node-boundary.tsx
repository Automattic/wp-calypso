import { Component, Suspense } from 'react';

class HideOnError extends Component< { children: React.ReactNode }, { hasError: boolean } > {
	state = { hasError: false };

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		return this.state.hasError ? null : this.props.children;
	}
}

export function OmnibarNodeBoundary( { children }: { children: React.ReactNode } ) {
	return (
		<HideOnError>
			<Suspense fallback={ null }>{ children }</Suspense>
		</HideOnError>
	);
}
