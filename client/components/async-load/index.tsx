import { lazy, useMemo, Suspense, type ComponentType, type ReactNode } from 'react';
import FallbackHeader from 'calypso/components/fallback-header';
import Loading from '../loading';
import './style.scss';

const DEFAULT_PLACEHOLDER = (
	<div className="fallback-signup-header">
		<FallbackHeader />
		<Loading title="Turning on the lights" />
	</div>
);

type AsyncLoadProps = {
	placeholder?: ReactNode;
	require: string;
	[ key: string ]: unknown;
};

type RequireCallback = () => Promise< { default: ComponentType } >;

export default function AsyncLoad( {
	placeholder = DEFAULT_PLACEHOLDER,
	require,
	...props
}: AsyncLoadProps ) {
	const Component = useMemo( () => {
		// The string is transformed to a function by the `wpcalypso-async` Babel transform
		const requireCb = require as unknown as RequireCallback;
		return lazy( requireCb );
	}, [ require ] );

	return (
		<Suspense fallback={ placeholder }>
			<Component { ...props } />
		</Suspense>
	);
}
