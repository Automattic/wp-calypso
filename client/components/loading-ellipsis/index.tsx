import classnames from 'classnames';
import type { ReactNode } from 'react';

export function LoadingEllipsis( { className }: { className?: string } ): ReactNode {
	return (
		// Styles are defined globally in _loading.scss so that this component
		// can be rendered on the server and will appear immediately.
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div className={ classnames( 'wpcom__loading-ellipsis', className ) }>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	);
}
