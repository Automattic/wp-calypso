interface ZoomIconProps {
	className?: string;
	size?: number;
}

export function ZoomIcon( { className, size = 24 }: ZoomIconProps ) {
	return (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
		>
			<path d="M7 17.5H17V19H7V17.5Z" fill="currentColor" />
			<path d="M7 5H17V6.5H7V5Z" fill="currentColor" />
			<path
				d="M5 9.5C5 8.67157 5.67157 8 6.5 8H17.5C18.3284 8 19 8.67157 19 9.5V14.5C19 15.3284 18.3284 16 17.5 16H6.5C5.67157 16 5 15.3284 5 14.5V9.5Z"
				fill="currentColor"
			/>
		</svg>
	);
}
