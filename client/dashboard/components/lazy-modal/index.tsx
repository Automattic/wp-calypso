import { lazy, Suspense, type ComponentType } from 'react';

// If you're getting a type error here, maybe check that the module you are dynamically
// importing (with `import()`) has a default export that is a React component.
type ExtractComponentProps< T > = T extends () => Promise< { default: infer U } >
	? U extends ComponentType< infer P >
		? P
		: never
	: never;

/**
 * Wraps React's built-in `lazy` function. No fallback is shown during loading, which
 * should be suitable when lazy-loading modals specifically.
 */
export function lazyModal< F extends Parameters< typeof lazy >[ 0 ] >( importFn: F ) {
	const LazyComponent = lazy( importFn );

	return function LazyModal( props: ExtractComponentProps< F > ) {
		return (
			<Suspense fallback={ null }>
				<LazyComponent { ...props } />
			</Suspense>
		);
	};
}
