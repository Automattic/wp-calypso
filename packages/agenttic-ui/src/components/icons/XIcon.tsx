interface XIconProps {
	className?: string;
	size?: number;
}

export function XIcon( { className, size = 24 }: XIconProps ) {
	return (
		<svg
			className={ className }
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12.0001 13.0607L16.4697 17.5304L17.5304 16.4697L13.0607 12.0001L17.5304 7.53039L16.4697 6.46973L12.0001 10.9394L7.5304 6.46973L6.46973 7.53039L10.9394 12.0001L6.46974 16.4697L7.5304 17.5304L12.0001 13.0607Z"
				fill="currentColor"
			/>
		</svg>
	);
}
