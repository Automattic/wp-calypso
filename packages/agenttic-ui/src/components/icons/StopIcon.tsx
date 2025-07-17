interface StopIconProps {
	className?: string;
	size?: number;
}

export function StopIcon( { className, size = 24 }: StopIconProps ) {
	return (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
		>
			<rect
				x="7"
				y="7"
				width="10"
				height="10"
				rx="2"
				fill="currentColor"
			/>
		</svg>
	);
}
