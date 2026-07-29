import { lazy, useMemo, Suspense, type ComponentType, type ReactNode } from 'react';

import './style.scss';

const DEFAULT_PLACEHOLDER = <div className="async-load__placeholder" />;

type RequireCallback = () => Promise< { default: ComponentType< any > } >;

type AsyncLoadProps = {
	placeholder?: ReactNode;
	loadFailureFallback?: ReactNode;
	onLoadFailure?: ( error: unknown ) => void;
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
	/* Guard the import only: a rejected `require()` renders the fallback; runtime errors inside the loaded component still propagate. */
	const Component = useMemo(
		() =>
			lazy( () => {
				if ( typeof loadFailureFallback === 'undefined' ) {
					return require();
				}

				return require().catch( ( error ) => {
					onLoadFailure?.( error );
					return { default: () => <>{ loadFailureFallback }</> };
				} );
			} ),
		/* Only `require` should recreate the lazy factory; adding fallback/handler would remount and re-import when callers pass inline values. */
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ require ]
	);

	return (
		<Suspense fallback={ placeholder }>
			<Component { ...props } />
		</Suspense>
	);
}
