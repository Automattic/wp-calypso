export function WireframePlaceholder( {
	height,
	children,
	className,
	style: additionalStyle,
}: {
	height?: React.CSSProperties[ 'height' ];
	children?: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
} ) {
	const style = {
		background: '#ff80ff',
		borderRadius: 10,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		...( height && { height } ),
		...additionalStyle,
	} as const;

	return (
		<div className={ className } style={ style }>
			{ children }
		</div>
	);
}
