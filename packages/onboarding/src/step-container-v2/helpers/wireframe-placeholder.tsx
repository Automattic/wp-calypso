export function WireframePlaceholder( {
	height,
	children,
	className,
}: {
	height?: React.CSSProperties[ 'height' ];
	children?: React.ReactNode;
	className?: string;
} ) {
	const style = {
		background: '#ff80ff',
		borderRadius: 10,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		...( height && { height } ),
	} as const;

	return (
		<div className={ className } style={ style }>
			{ children }
		</div>
	);
}
