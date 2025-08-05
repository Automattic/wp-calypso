interface ChevronDownIconProps {
	className?: string;
	size?: number;
}

export function ChevronDownIcon( {
	className,
	size = 24,
}: ChevronDownIconProps ) {
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
				fillRule="evenodd"
				clipRule="evenodd"
				d="M18.0045 10.5549L12 16.0136L5.9955 10.5549L7.00451 9.44504L12 13.9864L16.9955 9.44504L18.0045 10.5549Z"
				fill="currentColor"
			/>
		</svg>
	);
}
