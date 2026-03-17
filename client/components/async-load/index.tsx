import {
	Component,
	lazy,
	Suspense,
	useMemo,
	type ComponentType,
	type ErrorInfo,
	type ReactNode,
} from 'react';

import './style.scss';

const DEFAULT_PLACEHOLDER = <div className="async-load__placeholder" />;

type AsyncLoadErrorBoundaryProps = {
	children: ReactNode;
	loadFailureFallback: ReactNode;
	onLoadFailure?: ( error: Error, errorInfo: ErrorInfo ) => void;
};

type AsyncLoadErrorBoundaryState = {
	hasError: boolean;
};

class AsyncLoadErrorBoundary extends Component<
	AsyncLoadErrorBoundaryProps,
	AsyncLoadErrorBoundaryState
> {
	state: AsyncLoadErrorBoundaryState = {
		hasError: false,
	};

	static getDerivedStateFromError(): AsyncLoadErrorBoundaryState {
		return {
			hasError: true,
		};
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		this.props.onLoadFailure?.( error, errorInfo );
	}

	render() {
		if ( this.state.hasError ) {
			return this.props.loadFailureFallback;
		}

		return this.props.children;
	}
}

type RequireCallback = () => Promise< { default: ComponentType< any > } >;

type AsyncLoadProps = {
	placeholder?: ReactNode;
	loadFailureFallback?: ReactNode;
	onLoadFailure?: ( error: Error, errorInfo: ErrorInfo ) => void;
	require: RequireCallback;
	[ key: string ]: unknown;
};

export default function AsyncLoad( {
	placeholder = DEFAULT_PLACEHOLDER,
	loadFailureFallback,
	onLoadFailure,
	require,
	...props
}: AsyncLoadProps ) {
	const Component = useMemo( () => lazy( require ), [ require ] );

	const content = (
		<Suspense fallback={ placeholder }>
			<Component { ...props } />
		</Suspense>
	);

	if ( typeof loadFailureFallback === 'undefined' ) {
		return content;
	}

	return (
		<AsyncLoadErrorBoundary
			loadFailureFallback={ loadFailureFallback }
			onLoadFailure={ onLoadFailure }
		>
			{ content }
		</AsyncLoadErrorBoundary>
	);
}
