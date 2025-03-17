export function WireframePlaceholder( {
	height,
	children,
	className,
}: {
	height?: number;
	children?: React.ReactNode;
	className?: string;
} ) {
	const style = {
		background: '#ff80ff',
		borderRadius: 10,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		...( height && { height } ),
	};

	return (
		<div className={ className } style={ style }>
			{ children }
		</div>
	);
}
