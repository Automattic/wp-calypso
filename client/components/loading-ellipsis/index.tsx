import classnames from 'classnames';

type LoadingEllipsisProps = {
	className?: string;
};

export function LoadingEllipsis( { className }: LoadingEllipsisProps ) {
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
