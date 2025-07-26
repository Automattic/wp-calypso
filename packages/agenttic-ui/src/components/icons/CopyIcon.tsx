interface CopyIconProps {
	className?: string;
	size?: number;
}

export function CopyIcon( { className, size = 24 }: CopyIconProps ) {
	return (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
			aria-hidden="true"
		>
			<path
				d="M14.5 12C14.5 11.1716 13.8284 10.5 13 10.5H8C7.17157 10.5 6.5 11.1716 6.5 12V17C6.5 17.8284 7.17157 18.5 8 18.5H13C13.8284 18.5 14.5 17.8284 14.5 17V12ZM16 14.5H16.5C17.3284 14.5 18 13.8284 18 13V8C18 7.17157 17.3284 6.5 16.5 6.5H11C10.1716 6.5 9.5 7.17157 9.5 8V9H13C14.6569 9 16 10.3431 16 12V14.5ZM19.5 13C19.5 14.6569 18.1569 16 16.5 16H16V17C16 18.6569 14.6569 20 13 20H8C6.34315 20 5 18.6569 5 17V12C5 10.3431 6.34315 9 8 9V8C8 6.34315 9.34315 5 11 5H16.5C18.1569 5 19.5 6.34315 19.5 8V13Z"
				fill="currentColor"
			/>
		</svg>
	);
}
