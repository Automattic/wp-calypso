interface XIconProps {
	className?: string;
	size?: number;
	strokeWidth?: number;
}

export function XIcon( { className, size = 24, strokeWidth = 2 }: XIconProps ) {
	return (
		<svg
			className={ className }
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={ strokeWidth }
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m18 6-12 12" />
			<path d="m6 6 12 12" />
		</svg>
	);
}
