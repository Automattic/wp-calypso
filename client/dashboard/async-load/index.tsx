import { lazy, useMemo, Suspense, type ComponentType } from 'react';

type AsyncLoadProps = {
	require: string;
	[ key: string ]: unknown;
};

type RequireCallback = () => Promise< { default: ComponentType } >;

export default function AsyncLoad( { require, ...props }: AsyncLoadProps ) {
	const Component = useMemo( () => {
		// The string is transformed to a function by the `wpcalypso-async` Babel transform
		const requireCb = require as unknown as RequireCallback;
		return lazy( requireCb );
	}, [ require ] );

	return (
		<Suspense>
			<Component { ...props } />
		</Suspense>
	);
}
