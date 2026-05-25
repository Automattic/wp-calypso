import { lazy, useMemo, Suspense, type ComponentType, type ReactNode } from 'react';

import './style.scss';

const DEFAULT_PLACEHOLDER = <div className="async-load__placeholder" />;

type RequireCallback = () => Promise< { default: ComponentType< any > } >;

type AsyncLoadProps = {
	placeholder?: ReactNode;
	require: RequireCallback;
	[ key: string ]: unknown;
};

export default function AsyncLoad( {
	placeholder = DEFAULT_PLACEHOLDER,
	require,
	...props
}: AsyncLoadProps ) {
	const Component = useMemo( () => lazy( require ), [ require ] );

	return (
		<Suspense fallback={ placeholder }>
			<Component { ...props } />
		</Suspense>
	);
}
